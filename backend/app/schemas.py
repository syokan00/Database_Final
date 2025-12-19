from pydantic import BaseModel, EmailStr, constr
from typing import Optional, List, Dict
from datetime import datetime

# User Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nickname: str
    year: Optional[int] = None
    grade: Optional[str] = None  # 学年：大一、大二、大三、大四、M1、M2、D1等

class UserLogin(BaseModel):
    username: EmailStr
    password: str

class UserPasswordUpdate(BaseModel):
    old_password: str
    new_password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    nickname: Optional[str] = None
    year: Optional[int] = None
    grade: Optional[str] = None
    major: Optional[str] = None
    bio: Optional[str] = None
    language_preference: str
    avatar_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    nickname: Optional[str] = None
    year: Optional[int] = None
    grade: Optional[str] = None
    major: Optional[str] = None
    bio: Optional[str] = None
    language_preference: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

# Post Schemas
class PostBase(BaseModel):
    title: constr(max_length=300)
    content: constr(max_length=10000)
    source_language: str
    category: str
    tags: Optional[List[str]] = []
    restriction_type: Optional[str] = None
    image_urls: Optional[str] = None  # Comma separated URLs
    attachments: Optional[List[Dict]] = None  # List of file attachments

class PostCreate(PostBase):
    pass

class CommentOut(BaseModel):
    id: int
    content: str
    author: UserOut
    created_at: datetime

    class Config:
        from_attributes = True

class PostOut(PostBase):
    id: int
    author: Optional[UserOut]
    translated_cache: Optional[Dict[str, str]] = None
    is_translated: bool
    likes: int
    liked_by_me: bool
    favorited_by_me: bool = False
    comments: List[CommentOut] = []
    attachments: Optional[List[Dict]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Comment Schemas
class CommentCreate(BaseModel):
    post_id: int
    content: str
    parent_id: Optional[int] = None

# Badge Schemas
class BadgeOut(BaseModel):
    id: int
    name: str
    description: str
    icon: str

    class Config:
        from_attributes = True

class UserBadgeOut(BaseModel):
    badge: BadgeOut
    awarded_at: datetime

    class Config:
        from_attributes = True

# Item Schemas
class ItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    status: str = "selling"
    category: str = "other"
    tags: Optional[List[str]] = []
    image_urls: Optional[str] = None # Comma separated
    contact_method: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    image_urls: Optional[str] = None
    contact_method: Optional[str] = None
    attachments: Optional[List[Dict]] = None

class ItemOut(ItemBase):
    id: int
    user_id: int
    owner: Optional[UserOut]
    created_at: datetime

    class Config:
        from_attributes = True
