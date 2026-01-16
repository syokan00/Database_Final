import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Celery app - optional, only works if Redis is available
# Initialize with lazy connection to avoid startup errors
celery_app = Celery("memolucky", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    imports=['app.translator'], # Ensure tasks are found
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_connection_max_retries=3,
    # Don't fail on connection errors during startup
    broker_connection_timeout=2,
    result_backend_transport_options={'master_name': 'mymaster'} if 'redis://' in REDIS_URL else {}
)

print("Celery app initialized (background tasks require Redis)")
print("If Redis is not available, background tasks will fail but app will continue running")
