import os
from celery import Celery

# Check if Redis is enabled
# Redis is disabled by default. Set REDIS_ENABLED=true to enable it.
REDIS_ENABLED = os.getenv("REDIS_ENABLED", "false").lower() == "true"
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Celery app - optional, only works if Redis is available
# Always use memory backend to prevent connection attempts when Redis is disabled
# This ensures Celery doesn't try to connect to Redis on import/startup
if REDIS_ENABLED:
    # Only use Redis broker if explicitly enabled
    try:
        celery_app = Celery("memolucky", broker=REDIS_URL, backend=REDIS_URL)
        celery_app.conf.update(
            task_serializer='json',
            accept_content=['json'],
            result_serializer='json',
            timezone='UTC',
            enable_utc=True,
            imports=['app.translator'], # Ensure tasks are found
            broker_connection_retry_on_startup=False,  # Don't retry on startup
            broker_connection_retry=False,  # Don't retry connections
            broker_connection_max_retries=0,  # No retries
            broker_connection_timeout=1,  # Very short timeout
            result_backend_transport_options={'master_name': 'mymaster'} if 'redis://' in REDIS_URL else {}
        )
        print("Celery app initialized (background tasks require Redis)")
    except Exception as e:
        # If Redis connection fails during initialization, fall back to memory backend
        print(f"Warning: Celery Redis initialization failed: {e}. Using memory backend instead.")
        celery_app = Celery("memolucky", broker="memory://", backend="cache+memory://")
        celery_app.conf.update(
            task_always_eager=True,
            task_serializer='json',
            accept_content=['json'],
            result_serializer='json',
            timezone='UTC',
            enable_utc=True,
        )
        print("Celery app initialized with memory backend (Redis connection failed)")
else:
    # Create a dummy Celery app that won't try to connect
    celery_app = Celery("memolucky", broker="memory://", backend="cache+memory://")
    celery_app.conf.update(
        task_always_eager=True,  # Execute tasks synchronously (no broker needed)
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
    )
    print("Celery app initialized with memory backend (Redis disabled)")
