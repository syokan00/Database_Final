from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database, auth, posts, badges, comments, items, uploads, favorites, users, notifications, messages

# Create tables (for dev simplicity, in prod use Alembic)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Memolucky API")

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
