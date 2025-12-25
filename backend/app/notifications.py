from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from . import models, database, auth, schemas

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def create_notification(
    db: Session,
    user_id: int,
    notification_type: str,
    actor_id: Optional[int] = None,
    target_type: Optional[str] = None,
    target_id: Optional[int] = None,
):
    """创建通知的辅助函数"""
    # 不给自己发通知
    if actor_id and actor_id == user_id:
        return None
    
    notification = models.Notification(
        user_id=user_id,
        type=notification_type,
        actor_id=actor_id,
        target_type=target_type,
        target_id=target_id,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@router.get("/", response_model=List[schemas.NotificationOut])
def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """获取当前用户的通知列表"""
    query = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    )
    
    if unread_only:
        query = query.filter(models.Notification.read == False)
    
    notifications = query.order_by(desc(models.Notification.created_at)).offset(skip).limit(limit).all()
    
    # 加载关联的actor用户信息
    for notif in notifications:
        if notif.actor_id:
            notif.actor = db.query(models.User).filter(models.User.id == notif.actor_id).first()
    
    return notifications


@router.get("/unread/count", response_model=dict)
def get_unread_count(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """获取未读通知数量"""
    count = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.read == False
    ).count()
    
    return {"count": count}


@router.put("/{notification_id}/read", status_code=200)
def mark_as_read(
    notification_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """标记通知为已读"""
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.read = True
    db.commit()
    return {"status": "read"}


@router.put("/read-all", status_code=200)
def mark_all_as_read(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """标记所有通知为已读"""
    db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id,
        models.Notification.read == False
    ).update({"read": True})
    db.commit()
    return {"status": "all_read"}

