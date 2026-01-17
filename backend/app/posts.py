from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from . import schemas, models, database, auth
import redis
import os
import bleach
from .services.badge_service import check_badges_for_user
from .utils.restriction_validators import validate_restriction


# Redis connection - optional
# Redis is disabled by default. Set REDIS_ENABLED=true to enable it.
REDIS_ENABLED = os.getenv("REDIS_ENABLED", "false").lower() == "true"
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_available = False
r = None

if REDIS_ENABLED:
    try:
        r = redis.from_url(REDIS_URL, socket_connect_timeout=1, socket_timeout=1, decode_responses=False)
        # Test connection with very short timeout
        r.ping()
        redis_available = True
        print("Redis connected successfully")
    except Exception as e:
        # Silently fail - Redis is optional
        redis_available = False
        r = None
        # Only print if explicitly enabled to reduce log noise
        if REDIS_ENABLED:
            print(f"Redis connection failed (optional): {e}")
else:
    print("Redis is disabled via REDIS_ENABLED=false")



router = APIRouter(prefix="/api/posts", tags=["posts"])

@router.get("/", response_model=List[schemas.PostOut])
def get_posts(
    skip: int = 0, 
    limit: int = 20, 
    category: Optional[str] = None,
    tag: Optional[str] = None,
    lang: Optional[str] = "ja",
    q: Optional[str] = None,
    db: Session = Depends(database.get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional) # Optional auth for viewing
):
    try:
        query = db.query(models.Post)
        
        if category:
            query = query.filter(models.Post.category == category)
        
        if tag:
            # Simple string match for now, ideally use Postgres Array or separate table
            query = query.filter(models.Post.tags.contains(tag))
            
        if q:
            query = query.filter(or_(
                models.Post.title.contains(q),
                models.Post.content.contains(q)
            ))
            
        posts = query.order_by(desc(models.Post.created_at)).offset(skip).limit(limit).all()
        
        # Process posts for display (translation fallback)
        results = []
        user_id = current_user.id if current_user else None
        
        for p in posts:
            # Check if liked
            liked = False
            if user_id:
                liked = db.query(models.Like).filter(
                    models.Like.post_id == p.id, 
                    models.Like.user_id == user_id
                ).first() is not None
                
            # Translation logic
            # If requested lang is not source, check cache
            # This logic is simplified for the response model
            # The frontend usually requests the full object and decides what to show
            # But here we can populate the 'content' field if we wanted to enforce lang
            
            # Check if favorited
            favorited = False
            if user_id:
                favorited = db.query(models.Favorite).filter(
                    models.Favorite.post_id == p.id,
                    models.Favorite.user_id == user_id
                ).first() is not None
            
            # Hide author information if post is anonymous
            author_info = None if p.is_anonymous else p.author
            
            results.append({
                "id": p.id,
                "title": p.title,
                "content": p.content, # Return original, let frontend switch
                "source_language": p.source_language,
                "category": p.category,
                "tags": p.tags.split(",") if p.tags else [],
                "restriction_type": p.restriction_type,
                "image_urls": p.image_urls,  # Add image_urls
                "attachments": p.attachments,  # Add file attachments
                "author": author_info,
                "author_id": p.author_id,  # Always include author_id for delete permission check
                "translated_cache": p.translated_cache,
                "is_translated": p.is_translated,
                "is_anonymous": p.is_anonymous,
                "likes": len(p.likes),
                "liked_by_me": liked,
                "favorited_by_me": favorited,
                "comments": p.comments,
                "created_at": p.created_at
            })
        
        return results
    except Exception as e:
        import logging
        logger = logging.getLogger("uvicorn")
        logger.error(f"Failed to fetch posts: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch posts: {str(e)}"
        )

@router.post("/", response_model=schemas.PostOut, status_code=status.HTTP_201_CREATED)
def create_post(
    post: schemas.PostCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
    background_tasks: BackgroundTasks = None
):
    import logging
    logger = logging.getLogger("uvicorn")
    
    try:
        # Rate limiting check (Redis) - optional
        if redis_available and r:
            # Limit: 1 post per 30 seconds
            key = f"post_limit:{current_user.id}"
            try:
                if r.get(key):
                    raise HTTPException(status_code=429, detail="Please wait 30 seconds before posting again.")
            except Exception as e:
                logger.warning(f"Redis rate limit check failed: {e}. Proceeding without rate limit.")
        
        # Validate restriction rules
        if post.restriction_type:
            is_valid, error_msg = validate_restriction(post.content, post.restriction_type)
            if not is_valid:
                raise HTTPException(status_code=400, detail=error_msg or "Content does not meet restriction requirements")
        
        # Sanitize content
        sanitized_content = bleach.clean(post.content, tags=['b', 'i', 'u', 'em', 'strong', 'a'], attributes={'a': ['href', 'title']})
        
        new_post = models.Post(
            title=post.title,
            content=sanitized_content,
            source_language=post.source_language,
            category=post.category,
            tags=",".join(post.tags) if post.tags else "",
            restriction_type=post.restriction_type,
            image_urls=post.image_urls,
            attachments=post.attachments,
            is_anonymous=post.is_anonymous if post.is_anonymous is not None else False,
            author_id=current_user.id
        )
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
    except HTTPException:
        # Re-raise HTTP exceptions (validation errors, rate limits, etc.)
        raise
    except Exception as e:
        # Rollback transaction on error
        db.rollback()
        error_msg = str(e)
        logger.error(f"Failed to create post (user {current_user.id}): {error_msg}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create post: {error_msg}"
        )
    
    try:
        # Check badges after creating post (first_post badge, night_owl, streak_poster, etc.)
        check_badges_for_user(current_user.id, db)
    except Exception as e:
        # Don't fail post creation if badge check fails
        print(f"Badge check failed after post creation: {e}")
    
    # NOTE: 已取消"翻译到当前语言"功能，暂不自动触发翻译任务
    
    # Set rate limit
    # Set rate limit (Redis) - optional
    if redis_available and r:
        r.setex(key, 30, "1")
    
    # Hide author information if post is anonymous
    author_info = None if new_post.is_anonymous else current_user
    
    return {
        "id": new_post.id,
        "title": new_post.title,
        "content": new_post.content,
        "source_language": new_post.source_language,
        "category": new_post.category,
        "tags": post.tags,
        "restriction_type": new_post.restriction_type,
        "image_urls": new_post.image_urls,
        "attachments": new_post.attachments,
        "author": author_info,
        "author_id": new_post.author_id,  # Always include author_id for delete permission check
        "translated_cache": None,
        "is_translated": False,
        "is_anonymous": new_post.is_anonymous,
        "likes": 0,
        "liked_by_me": False,
        "comments": [],
        "created_at": new_post.created_at
    }

@router.get("/{id}", response_model=schemas.PostOut)
def get_post(
    id: int, 
    db: Session = Depends(database.get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional)
):
    post = db.query(models.Post).filter(models.Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    user_id = current_user.id if current_user else None
    liked = False
    if user_id:
        liked = db.query(models.Like).filter(
            models.Like.post_id == post.id, 
            models.Like.user_id == user_id
        ).first() is not None

    # Check if favorited
    favorited = False
    if user_id:
        favorited = db.query(models.Favorite).filter(
            models.Favorite.post_id == post.id,
            models.Favorite.user_id == user_id
        ).first() is not None
    
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "source_language": post.source_language,
        "category": post.category,
        "tags": post.tags.split(",") if post.tags else [],
        "restriction_type": post.restriction_type,
        "image_urls": post.image_urls,
        "attachments": post.attachments,
        "author": post.author,
        "translated_cache": post.translated_cache,
        "is_translated": post.is_translated,
        "likes": len(post.likes),
        "liked_by_me": liked,
        "favorited_by_me": favorited,
        "comments": post.comments,
        "created_at": post.created_at
    }

@router.post("/{id}/like")
def like_post(
    id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    existing_like = db.query(models.Like).filter(
        models.Like.post_id == id,
        models.Like.user_id == current_user.id
    ).first()
    
    if existing_like:
        raise HTTPException(status_code=400, detail="Already liked")
        
    new_like = models.Like(post_id=id, user_id=current_user.id)
    db.add(new_like)
    db.commit()
    
    # Create notification for post author
    if post.author_id != current_user.id:
        notification = models.Notification(
            user_id=post.author_id,
            type="like",
            actor_id=current_user.id,
            target_type="post",
            target_id=id,
        )
        db.add(notification)
        db.commit()
    
    # Check badges (Popularity) - usually done async or in badge service
    # For simplicity, we can trigger a check here or rely on the async task
    # Check badges (Popularity)
    check_badges_for_user(post.author_id, db)
    
    return {"status": "liked", "likes": len(post.likes)}

@router.delete("/{id}/like")
def unlike_post(
    id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing_like = db.query(models.Like).filter(
        models.Like.post_id == id,
        models.Like.user_id == current_user.id
    ).first()
    
    if not existing_like:
        raise HTTPException(status_code=400, detail="Not liked")
        
    db.delete(existing_like)
    db.commit()
    
    post = db.query(models.Post).filter(models.Post.id == id).first()
    return {"status": "unliked", "likes": len(post.likes)}

@router.put("/{id}", response_model=schemas.PostOut)
def update_post(
    id: int,
    post_update: schemas.PostCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
    background_tasks: BackgroundTasks = None
):
    """更新帖子（仅作者或管理员）"""
    post = db.query(models.Post).filter(models.Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    
    # Update fields
    post.title = post_update.title
    post.content = post_update.content
    post.category = post_update.category
    post.tags = ",".join(post_update.tags) if post_update.tags else ""
    post.restriction_type = post_update.restriction_type
    post.image_urls = post_update.image_urls
    post.attachments = post_update.attachments
    if post_update.is_anonymous is not None:
        post.is_anonymous = post_update.is_anonymous
    
    # If content changed, clear translation cache (translation feature disabled)
    if post.content != post_update.content:
        post.is_translated = False
        post.translated_cache = None
    
    db.commit()
    db.refresh(post)
    
    # Return updated post
    liked = db.query(models.Like).filter(
        models.Like.post_id == post.id,
        models.Like.user_id == current_user.id
    ).first() is not None
    
    favorited = db.query(models.Favorite).filter(
        models.Favorite.post_id == post.id,
        models.Favorite.user_id == current_user.id
    ).first() is not None
    
    # Hide author information if post is anonymous
    author_info = None if post.is_anonymous else post.author
    
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "source_language": post.source_language,
        "category": post.category,
        "tags": post.tags.split(",") if post.tags else [],
        "restriction_type": post.restriction_type,
        "image_urls": post.image_urls,
        "attachments": post.attachments,
        "author": author_info,
        "author_id": post.author_id,  # Always include author_id for delete permission check
        "translated_cache": post.translated_cache,
        "is_translated": post.is_translated,
        "is_anonymous": post.is_anonymous,
        "likes": len(post.likes),
        "liked_by_me": liked,
        "favorited_by_me": favorited,
        "comments": post.comments,
        "created_at": post.created_at
    }

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    post = db.query(models.Post).filter(models.Post.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        
    db.delete(post)
    db.commit()
    return
