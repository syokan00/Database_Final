from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from . import models, database, auth, schemas

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me/following", response_model=List[int])
def get_my_following(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    rows = db.query(models.Follow.following_id).filter(
        models.Follow.follower_id == current_user.id
    ).all()
    return [r[0] for r in rows]


@router.post("/{user_id}/follow", status_code=status.HTTP_200_OK)
def follow_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    existing = db.query(models.Follow).filter(
        models.Follow.follower_id == current_user.id,
        models.Follow.following_id == user_id,
    ).first()
    if existing:
        return {"status": "following"}

    db.add(models.Follow(follower_id=current_user.id, following_id=user_id))
    db.commit()
    return {"status": "following"}


@router.delete("/{user_id}/follow", status_code=status.HTTP_200_OK)
def unfollow_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot unfollow yourself")

    row = db.query(models.Follow).filter(
        models.Follow.follower_id == current_user.id,
        models.Follow.following_id == user_id,
    ).first()
    if not row:
        return {"status": "not_following"}

    db.delete(row)
    db.commit()
    return {"status": "not_following"}


@router.get("/{user_id}/stats", status_code=status.HTTP_200_OK)
def get_user_stats(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user_optional),
):
    target = db.query(models.User).filter(models.User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    follower_count = db.query(func.count(models.Follow.id)).filter(
        models.Follow.following_id == user_id
    ).scalar() or 0
    following_count = db.query(func.count(models.Follow.id)).filter(
        models.Follow.follower_id == user_id
    ).scalar() or 0

    followed_by_me = False
    if current_user:
        followed_by_me = db.query(models.Follow).filter(
            models.Follow.follower_id == current_user.id,
            models.Follow.following_id == user_id,
        ).first() is not None

    return {
        "user": schemas.UserOut.model_validate(target),
        "follower_count": follower_count,
        "following_count": following_count,
        "followed_by_me": followed_by_me,
    }


