from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from . import models, database, auth, posts, badges, comments, items, uploads, favorites, users, notifications, messages

# Initialize database tables (delayed until after database connection is established)
def init_database():
    """Create all database tables if they don't exist"""
    try:
        models.Base.metadata.create_all(bind=database.engine)
        print("Database tables initialized successfully")
    except Exception as e:
        print(f"Warning: Could not create tables (they may already exist): {e}")
        # Don't fail startup if tables already exist

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

# Initialize database and run migrations on startup
init_database()
migrate_database()

# Initialize badges data if not exists
def init_badges_data():
    """Initialize badges data from init.sql"""
    from .models import Badge
    from sqlalchemy.orm import Session
    
    badges_data = [
        ('first_post', 'First post created', '🥚'),
        ('night_owl', 'Posted between 0:00-6:00', '⭐'),
        ('streak_poster', 'Posted 5 days in a row', '🔥'),
        ('polyglot', 'Posted in multiple languages', '💬'),
        ('heart_collector', 'Received 10 likes', '❤️'),
        ('comment_king', 'Posted 20 comments', '👑'),
        ('helpful_friend', 'Comment liked 5 times', '🛡️'),
        ('smart_buyer', 'Bought 3 items', '🛍️'),
        ('top_seller', 'Sold 5 items', '🏷️'),
        ('treasure_hunter', 'Found a rare item', '🧭'),
        ('lucky_clover', 'Completed a random task', '⚡'),
        ('heart_artist', 'Used like effect 10 times', '🎨'),
        ('brave_beginner', 'First login', '👶'),
        ('lost_scholar', 'Visited all pages', '🗺️'),
    ]
    
    try:
        db = next(database.get_db())
        for name, description, icon in badges_data:
            existing = db.query(Badge).filter(Badge.name == name).first()
            if not existing:
                badge = Badge(name=name, description=description, icon=icon)
                db.add(badge)
        db.commit()
        print("Badges data initialized successfully")
    except Exception as e:
        print(f"Warning: Badges initialization encountered an error: {e}")
    finally:
        db.close()

# Initialize badges on startup
init_badges_data()

app = FastAPI(title="Memolucky API")

# CORS - Configure allowed origins
# Allow GitHub Pages and local development
import os
allowed_origins = [
    "https://syokan00.github.io",  # GitHub Pages production
    "http://localhost:5173",        # Local Vite dev server
    "http://localhost:3000",        # Local Docker frontend
]

# In development, allow all origins for easier testing
# In production, use specific origins for security
if os.getenv("ENVIRONMENT") != "production":
    allowed_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
