from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from . import schemas, models, database, auth
from .services.badge_service import check_badges_for_user

router = APIRouter(prefix="/api/items", tags=["items"])


def _item_to_out(item: models.Item):
    return {
        "id": item.id,
        "user_id": item.user_id,
        "title": item.title,
        "description": item.description,
        "price": float(item.price) if item.price is not None else 0.0,
        "status": item.status,
        "category": item.category,
        "tags": item.tags.split(",") if item.tags else [],
        "image_urls": item.image_urls,
        "contact_method": item.contact_method,
        "owner": item.owner,
        "created_at": item.created_at,
    }

@router.get("/", response_model=List[schemas.ItemOut])
def get_items(
    skip: int = 0, 
    limit: int = 20, 
    category: str = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Item)
    if category and category != 'all':
        query = query.filter(models.Item.category == category)
        
    items = query.order_by(desc(models.Item.created_at)).offset(skip).limit(limit).all()
    
    return [_item_to_out(i) for i in items]

@router.post("/", response_model=schemas.ItemOut, status_code=status.HTTP_201_CREATED)
def create_item(
    item: schemas.ItemCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 验证必需字段
    if not item.title or not item.title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
    
    # 验证价格
    if item.price is None or item.price < 0:
        raise HTTPException(status_code=400, detail="Price must be a non-negative number")
    
    new_item = models.Item(
        title=item.title.strip(),
        description=item.description.strip() if item.description else None,
        price=item.price,
        status=item.status or "selling",
        category=item.category or "other",
        tags=",".join(item.tags) if item.tags else "",
        image_urls=item.image_urls,
        contact_method=item.contact_method,
        user_id=current_user.id
    )
    
    # Item模型没有attachments字段，忽略它（如果前端发送了）
    # attachments字段只在Post模型中存在
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    try:
        # Check badges after creating item (top_seller, etc.)
        check_badges_for_user(current_user.id, db)
    except Exception as e:
        # Don't fail item creation if badge check fails
        print(f"Badge check failed after item creation: {e}")
    
    return _item_to_out(new_item)

@router.get("/{id}", response_model=schemas.ItemOut)
def get_item(id: int, db: Session = Depends(database.get_db)):
    item = db.query(models.Item).filter(models.Item.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return _item_to_out(item)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    item = db.query(models.Item).filter(models.Item.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")
        
    db.delete(item)
    db.commit()
    return


@router.put("/{id}", response_model=schemas.ItemOut)
def update_item(
    id: int,
    payload: schemas.ItemUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    item = db.query(models.Item).filter(models.Item.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.user_id != current_user.id and getattr(current_user, "role", "user") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this item")

    if payload.title is not None:
        item.title = payload.title
    if payload.description is not None:
        item.description = payload.description
    if payload.price is not None:
        item.price = payload.price
    if payload.status is not None:
        item.status = payload.status
    if payload.category is not None:
        item.category = payload.category
    if payload.tags is not None:
        item.tags = ",".join(payload.tags) if payload.tags else ""
    if payload.image_urls is not None:
        item.image_urls = payload.image_urls
    if payload.contact_method is not None:
        item.contact_method = payload.contact_method
    if payload.attachments is not None:
        item.attachments = payload.attachments

    db.add(item)
    db.commit()
    db.refresh(item)
    return _item_to_out(item)
