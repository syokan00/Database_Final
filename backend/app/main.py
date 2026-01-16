from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from . import models, database, auth, posts, badges, comments, items, uploads, favorites, users, notifications, messages

# Create tables (for dev simplicity, in prod use Alembic)
models.Base.metadata.create_all(bind=database.engine)

# Auto-migrate: Add missing columns to existing tables
def migrate_database():
    """Automatically add missing columns to existing tables"""
    migration_sql = [
        # Users table migrations
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS grade VARCHAR(64);",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;",
        # Posts table migrations
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls TEXT;",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments JSONB;",
        "ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;",
        # Items table migrations
        "ALTER TABLE items ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;",
    ]
    
    try:
        with database.engine.begin() as conn:
            for sql in migration_sql:
                try:
                    conn.execute(text(sql))
                except Exception as e:
                    # Ignore errors if column already exists or other non-critical issues
                    print(f"Migration note (may be safe to ignore): {e}")
        print("Database migration completed successfully")
    except Exception as e:
        print(f"Warning: Database migration encountered an error: {e}")

# Run migrations on startup
migrate_database()

app = FastAPI(title="Memolucky API")

# CORS - Allow all origins in development
# In production, you should restrict this to specific domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(badges.router)
app.include_router(comments.router)
app.include_router(items.router)
app.include_router(uploads.router)
app.include_router(favorites.router)
app.include_router(users.router)
app.include_router(notifications.router)
app.include_router(messages.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Memolucky API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
