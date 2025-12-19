from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from . import schemas, models, database, auth

router = APIRouter(prefix="/api/badges", tags=["badges"])

@router.get("/", response_model=List[schemas.BadgeOut])
def get_all_badges(db: Session = Depends(database.get_db)):
    return db.query(models.Badge).all()

@router.get("/me", response_model=List[schemas.UserBadgeOut])
def get_my_badges(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return current_user.badges

@router.get("/users/{user_id}", response_model=List[schemas.UserBadgeOut])
def get_user_badges(
    user_id: int,
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return []
    return user.badges
