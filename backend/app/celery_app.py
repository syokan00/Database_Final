import os
from celery import Celery

# Check if Redis is enabled
REDIS_ENABLED = os.getenv("REDIS_ENABLED", "true").lower() == "true"
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Celery app - optional, only works if Redis is available
# Use a dummy broker if Redis is disabled to prevent connection attempts
if REDIS_ENABLED:
    celery_app = Celery("memolucky", broker=REDIS_URL, backend=REDIS_URL)
    
    celery_app.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
        imports=['app.translator'], # Ensure tasks are found
        broker_connection_retry_on_startup=False,  # Don't retry on startup
        broker_connection_retry=True,
        broker_connection_max_retries=1,  # Only retry once
        broker_connection_timeout=1,  # Very short timeout
        result_backend_transport_options={'master_name': 'mymaster'} if 'redis://' in REDIS_URL else {}
    )
    print("Celery app initialized (background tasks require Redis)")
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
