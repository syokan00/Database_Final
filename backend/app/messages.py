from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, and_
from . import models, database, auth, schemas

router = APIRouter(prefix="/api/messages", tags=["messages"])


class MessageCreate(BaseModel):
    content: str
    receiver_id: Optional[int] = None


@router.post("/items/{item_id}")
def send_item_message(
    item_id: int,
    message: MessageCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """发送商品聊天消息"""
    # 获取商品信息
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # 确定接收者
    if current_user.id == item.user_id:
        # 卖家发送：需要指定买家
        if not message.receiver_id:
            raise HTTPException(status_code=400, detail="Seller must specify receiver_id (buyer)")
        if message.receiver_id == current_user.id:
            raise HTTPException(status_code=400, detail="Cannot send message to yourself")
        receiver_id = message.receiver_id
    else:
        # 买家发送：接收者是卖家
        receiver_id = item.user_id
    
    # 创建消息
    new_message = models.ItemMessage(
        item_id=item_id,
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=message.content,
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    
    # 创建通知给接收者（不给自己发通知）
    if receiver_id != current_user.id:
        notification = models.Notification(
            user_id=receiver_id,
            type="message",
            actor_id=current_user.id,
            target_type="item",
            target_id=item_id,
        )
        db.add(notification)
        db.commit()
    
    return {
        "id": new_message.id,
        "content": new_message.content,
        "sender_id": new_message.sender_id,
        "receiver_id": new_message.receiver_id,
        "created_at": new_message.created_at,
    }


@router.get("/items/{item_id}")
def get_item_messages(
    item_id: int,
    other_user_id: Optional[int] = Query(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """获取商品聊天消息"""
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # 确定另一个用户：如果是买家，另一个用户是卖家；如果是卖家，需要指定买家或获取最近联系的买家
    if current_user.id == item.user_id:
        # 卖家：如果没有指定买家，获取最近联系的买家
        if not other_user_id:
            # 查找最近给卖家发送消息的买家
            recent_message = db.query(models.ItemMessage).filter(
                models.ItemMessage.item_id == item_id,
                models.ItemMessage.receiver_id == current_user.id
            ).order_by(desc(models.ItemMessage.created_at)).first()
            
            if recent_message:
                other_user = recent_message.sender_id
            else:
                # 如果没有收到过消息，返回空列表
                return []
        else:
            other_user = other_user_id
    else:
        # 买家：另一个用户是卖家
        other_user = item.user_id
    
    # 获取双方的消息
    messages = db.query(models.ItemMessage).filter(
        models.ItemMessage.item_id == item_id,
        or_(
            and_(
                models.ItemMessage.sender_id == current_user.id,
                models.ItemMessage.receiver_id == other_user
            ),
            and_(
                models.ItemMessage.sender_id == other_user,
                models.ItemMessage.receiver_id == current_user.id
            )
        )
    ).order_by(models.ItemMessage.created_at.asc()).all()
    
    result = []
    for msg in messages:
        sender = db.query(models.User).filter(models.User.id == msg.sender_id).first()
        result.append({
            "id": msg.id,
            "content": msg.content,
            "sender_id": msg.sender_id,
            "sender": schemas.UserOut.model_validate(sender) if sender else None,
            "receiver_id": msg.receiver_id,
            "created_at": msg.created_at,
        })
    
    return result


@router.get("/items")
def get_my_item_conversations(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """获取当前用户的所有商品聊天会话列表"""
    # 获取所有与当前用户相关的消息
    messages = db.query(models.ItemMessage).filter(
        or_(
            models.ItemMessage.sender_id == current_user.id,
            models.ItemMessage.receiver_id == current_user.id
        )
    ).order_by(desc(models.ItemMessage.created_at)).all()
    
    # 按商品和对方用户分组
    conversations = {}
    for msg in messages:
        # 确定对方用户
        other_user_id = msg.receiver_id if msg.sender_id == current_user.id else msg.sender_id
        
        # 确定会话key
        key = f"{msg.item_id}_{other_user_id}"
        
        if key not in conversations:
            item = db.query(models.Item).filter(models.Item.id == msg.item_id).first()
            other_user = db.query(models.User).filter(models.User.id == other_user_id).first()
            
            conversations[key] = {
                "item_id": msg.item_id,
                "item": schemas.ItemOut.model_validate(item) if item else None,
                "other_user": schemas.UserOut.model_validate(other_user) if other_user else None,
                "last_message": msg.content,
                "last_message_time": msg.created_at,
                "unread_count": 0,  # 可以后续添加未读计数
            }
    
    return list(conversations.values())

