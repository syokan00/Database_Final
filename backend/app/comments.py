from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import schemas, models, database, auth
import redis
import os

# Redis connection
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
r = redis.from_url(REDIS_URL)

router = APIRouter(prefix="/api/comments", tags=["comments"])

@router.post("/", response_model=schemas.CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment: schemas.CommentCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Rate limiting (Redis)
    # Limit: 1 comment per 10 seconds
    key = f"comment_limit:{current_user.id}"
    if r.get(key):
        raise HTTPException(status_code=429, detail="Please wait 10 seconds before commenting again.")
    
    post = db.query(models.Post).filter(models.Post.id == comment.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    new_comment = models.Comment(
        post_id=comment.post_id,
        author_id=current_user.id,
        content=comment.content,
        parent_id=comment.parent_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    # Set rate limit
    r.setex(key, 10, "1")
    
    return new_comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    删除评论：仅评论作者或管理员可删除。
    处理方式：若存在子评论，先将其 parent_id 置空，避免外键约束问题。
    """
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.author_id != current_user.id and getattr(current_user, "role", "user") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    # Detach children to avoid FK constraint issues
    children = db.query(models.Comment).filter(models.Comment.parent_id == comment.id).all()
    for child in children:
        child.parent_id = None

    db.delete(comment)
    db.commit()
    return