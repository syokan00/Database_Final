from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import models, database, auth, schemas

router = APIRouter(prefix="/api/favorites", tags=["favorites"])

@router.post("/posts/{post_id}")
def add_favorite(
    post_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """收藏帖子"""
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if already favorited
    existing = db.query(models.Favorite).filter(
        models.Favorite.post_id == post_id,
        models.Favorite.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already favorited")
    
    favorite = models.Favorite(post_id=post_id, user_id=current_user.id)
    db.add(favorite)
    db.commit()
    
    # Create notification for post author
    if post.author_id != current_user.id:
        notification = models.Notification(
            user_id=post.author_id,
            type="favorite",
            actor_id=current_user.id,
            target_type="post",
            target_id=post_id,
        )
        db.add(notification)
        db.commit()
    
    return {"status": "favorited", "message": "Post favorited successfully"}

@router.delete("/posts/{post_id}")
def remove_favorite(
    post_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """取消收藏"""
    favorite = db.query(models.Favorite).filter(
        models.Favorite.post_id == post_id,
        models.Favorite.user_id == current_user.id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(favorite)
    db.commit()
    
    return {"status": "unfavorited", "message": "Post unfavorited successfully"}

@router.get("/me", response_model=List[schemas.PostOut])
def get_my_favorites(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """获取我收藏的帖子"""
    favorites = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    post_ids = [f.post_id for f in favorites]
    if not post_ids:
        return []
    posts = db.query(models.Post).filter(models.Post.id.in_(post_ids)).all()
    
    results = []
    for p in posts:
        liked = db.query(models.Like).filter(
            models.Like.post_id == p.id,
            models.Like.user_id == current_user.id
        ).first() is not None
        
        favorited = db.query(models.Favorite).filter(
            models.Favorite.post_id == p.id,
            models.Favorite.user_id == current_user.id
        ).first() is not None
        
        results.append({
            "id": p.id,
            "title": p.title,
            "content": p.content,
            "source_language": p.source_language,
            "category": p.category,
            "tags": p.tags.split(",") if p.tags else [],
            "restriction_type": p.restriction_type,
            "author": p.author,
            "translated_cache": p.translated_cache,
            "is_translated": p.is_translated,
            "likes": len(p.likes),
            "liked_by_me": liked,
            "favorited_by_me": favorited,
            "comments": p.comments,
            "created_at": p.created_at
        })
    
    return results

