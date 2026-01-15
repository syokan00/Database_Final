from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import os

from . import schemas, models, database

# Config
SECRET_KEY = os.getenv("JWT_SECRET")
if not SECRET_KEY:
    raise ValueError("JWT_SECRET environment variable is required. Please set it in .env file.")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

router = APIRouter(prefix="/api/auth", tags=["auth"])

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

async def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(database.get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    
    user = db.query(models.User).filter(models.User.email == email).first()
    return user

@router.post("/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    import logging
    logger = logging.getLogger("uvicorn")
    
    try:
        # Input validation
        if not user.email or not user.email.strip():
            raise HTTPException(status_code=400, detail="Email is required")
        
        if not user.password or len(user.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        if not user.nickname or not user.nickname.strip():
            raise HTTPException(status_code=400, detail="Nickname is required")
        
        # Check if email already exists
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        try:
            hashed_password = get_password_hash(user.password)
        except Exception as e:
            logger.error(f"Password hashing failed: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to process password. Please try again.")
        
        # Create new user
        new_user = models.User(
            email=user.email.strip(),
            password_hash=hashed_password,
            nickname=user.nickname.strip(),
            year=user.year,
            grade=user.grade
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logger.info(f"User registered successfully: {user.email}")
        return new_user
        
    except HTTPException:
        # Re-raise HTTP exceptions (validation errors, etc.)
        raise
    except Exception as e:
        # Rollback transaction on error
        db.rollback()
        error_msg = str(e)
        logger.error(f"Registration failed for {user.email}: {error_msg}", exc_info=True)
        
        # Return more detailed error message for debugging
        # In production, you might want to hide some details
        detail_msg = f"Registration failed: {error_msg}"
        raise HTTPException(
            status_code=500, 
            detail=detail_msg
        )

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # OAuth2PasswordRequestForm uses 'username' and 'password'
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60}

@router.get("/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UserOut, status_code=status.HTTP_200_OK)
def update_me(
    payload: schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    更新当前用户资料：学年(grade)、入学年份(year)、专业(major)、昵称(nickname)、简介(bio)、语言偏好(language_preference)
    """
    if payload.nickname is not None:
        current_user.nickname = payload.nickname.strip() if payload.nickname else None

    if payload.major is not None:
        current_user.major = payload.major.strip() if payload.major else None

    if payload.bio is not None:
        current_user.bio = payload.bio.strip() if payload.bio else None

    if payload.year is not None:
        # 允许为空/0？这里做基本范围校验
        if payload.year < 1900 or payload.year > 2100:
            raise HTTPException(status_code=400, detail="Invalid year")
        current_user.year = payload.year

    if payload.grade is not None:
        current_user.grade = payload.grade.strip() if payload.grade else None

    if payload.language_preference is not None:
        if payload.language_preference not in ["ja", "zh", "en"]:
            raise HTTPException(status_code=400, detail="Invalid language_preference")
        current_user.language_preference = payload.language_preference

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/password", status_code=status.HTTP_200_OK)
def change_password(
    password_data: schemas.UserPasswordUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not verify_password(password_data.old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
