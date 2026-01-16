from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Query
from minio import Minio
from minio.error import S3Error
import os
from datetime import datetime
from . import auth, models, database, schemas
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "memoluck-files")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"
MINIO_EXTERNAL_URL = os.getenv("MINIO_EXTERNAL_URL", "http://localhost:9002")

# MinIO client - optional, will be None if not configured
minio_client = None
minio_available = False

# Try to initialize MinIO if credentials are provided
if MINIO_ACCESS_KEY and MINIO_SECRET_KEY:
    try:
        minio_client = Minio(
            MINIO_ENDPOINT,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=MINIO_SECURE
        )
        # Test connection by checking bucket
        if minio_client.bucket_exists(MINIO_BUCKET):
            minio_available = True
            print(f"MinIO connected successfully to {MINIO_ENDPOINT}/{MINIO_BUCKET}")
        else:
            # Try to create bucket
            try:
                minio_client.make_bucket(MINIO_BUCKET)
                # Set policy to public read for avatar display
                policy = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}' % MINIO_BUCKET
                minio_client.set_bucket_policy(MINIO_BUCKET, policy)
                minio_available = True
                print(f"MinIO bucket {MINIO_BUCKET} created successfully")
            except Exception as e:
                print(f"MinIO bucket creation failed: {e}")
                minio_available = False
    except Exception as e:
        print(f"MinIO initialization failed: {e}")
        print("Upload functionality will be disabled. Please configure MinIO or use alternative storage.")
        minio_available = False
else:
    print("MinIO credentials not provided. Upload functionality will be disabled.")
    print("To enable uploads, set MINIO_ACCESS_KEY and MINIO_SECRET_KEY environment variables.")

@router.post("/avatar", response_model=schemas.UserOut)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "image/gif", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid image type")
    
    # Validate file size (max 5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
    
    # Generate object name
    import uuid
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    object_name = f"avatars/{current_user.id}_{uuid.uuid4()}.{file_ext}"
    
    if not minio_available or not minio_client:
        raise HTTPException(
            status_code=503, 
            detail="File upload service is not available. Please contact the administrator or configure MinIO storage."
        )
    
    try:
        # Upload to MinIO
        minio_client.put_object(
            MINIO_BUCKET,
            object_name,
            file.file,
            file.size,
            content_type=file.content_type
        )
        
        # Construct public URL
        avatar_url = f"{MINIO_EXTERNAL_URL}/{MINIO_BUCKET}/{object_name}"
        
        # Update user profile
        current_user.avatar_url = avatar_url
        db.commit()
        db.refresh(current_user)
        
        return current_user
        
    except S3Error as e:
        print(f"MinIO S3 error: {e}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    except Exception as e:
        print(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="File upload failed")

@router.post("/cover", response_model=schemas.UserOut)
async def upload_cover(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    """上传个人主页背景图"""
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "image/gif", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid image type")
    
    # Validate file size (max 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")
    
    # Generate object name
    import uuid
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    object_name = f"covers/{current_user.id}_{uuid.uuid4()}.{file_ext}"
    
    if not minio_available or not minio_client:
        raise HTTPException(
            status_code=503, 
            detail="File upload service is not available. Please contact the administrator or configure MinIO storage."
        )
    
    try:
        # Upload to MinIO
        minio_client.put_object(
            MINIO_BUCKET,
            object_name,
            file.file,
            file.size,
            content_type=file.content_type
        )
        
        # Construct public URL
        cover_url = f"{MINIO_EXTERNAL_URL}/{MINIO_BUCKET}/{object_name}"
        
        # Update user profile
        current_user.cover_image_url = cover_url
        db.commit()
        db.refresh(current_user)
        
        return current_user
        
    except S3Error as e:
        print(f"MinIO S3 error: {e}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    except Exception as e:
        print(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="File upload failed")

@router.post("/post-image")
async def upload_post_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    """上传帖子图片"""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid image type. Allowed: JPEG, PNG, GIF, WebP")
    
    # Validate file size (max 5MB)
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    if file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
    
    # Generate object name
    import uuid
    from datetime import datetime
    file_ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    timestamp = datetime.now().strftime("%Y%m%d")
    object_name = f"posts/{current_user.id}/{timestamp}_{uuid.uuid4()}.{file_ext}"
    
    if not minio_available or not minio_client:
        raise HTTPException(
            status_code=503, 
            detail="File upload service is not available. Please contact the administrator or configure MinIO storage."
        )
    
    try:
        # Upload to MinIO
        minio_client.put_object(
            MINIO_BUCKET,
            object_name,
            file.file,
            file.size,
            content_type=file.content_type
        )
        
        # Construct public URL
        image_url = f"{MINIO_EXTERNAL_URL}/{MINIO_BUCKET}/{object_name}"
        
        return {
            "url": image_url,
            "filename": file.filename,
            "size": file.size
        }
        
    except S3Error as e:
        print(f"MinIO S3 error: {e}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    except Exception as e:
        print(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="File upload failed")

@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    """上传任意类型文件（类似Discord）"""
    import uuid
    
    # 文件类型分类和大小限制
    file_categories = {
        'image': {
            'types': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
            'max_size': 10 * 1024 * 1024,  # 10MB
            'extensions': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
        },
        'video': {
            'types': ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
            'max_size': 50 * 1024 * 1024,  # 50MB
            'extensions': ['.mp4', '.webm', '.mov', '.avi']
        },
        'audio': {
            'types': ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
            'max_size': 20 * 1024 * 1024,  # 20MB
            'extensions': ['.mp3', '.wav', '.ogg']
        },
        'document': {
            'types': ['application/pdf', 'application/msword', 
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                     'application/vnd.ms-excel',
                     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     'text/plain', 'application/rtf'],
            'max_size': 20 * 1024 * 1024,  # 20MB
            'extensions': ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.rtf']
        },
        'archive': {
            'types': ['application/zip', 'application/x-rar-compressed', 
                     'application/x-7z-compressed', 'application/x-tar'],
            'max_size': 50 * 1024 * 1024,  # 50MB
            'extensions': ['.zip', '.rar', '.7z', '.tar', '.gz']
        }
    }
    
    # 检测文件类型
    file_category = 'other'
    max_size = 10 * 1024 * 1024  # 默认10MB
    file_ext = '.' + file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    
    for category, config in file_categories.items():
        if file.content_type in config['types'] or file_ext in config['extensions']:
            file_category = category
            max_size = config['max_size']
            break
    
    # 验证文件大小
    if file.size and file.size > max_size:
        raise HTTPException(
            status_code=400, 
            detail=f"File size exceeds {max_size / 1024 / 1024}MB limit for {file_category} files"
        )
    
    # 生成对象名
    timestamp = datetime.now().strftime("%Y%m%d")
    safe_filename = file.filename.replace(' ', '_')
    object_name = f"files/{current_user.id}/{file_category}/{timestamp}_{uuid.uuid4()}{file_ext}"
    
    if not minio_available or not minio_client:
        raise HTTPException(
            status_code=503, 
            detail="File upload service is not available. Please contact the administrator or configure MinIO storage."
        )
    
    try:
        # 上传到MinIO
        minio_client.put_object(
            MINIO_BUCKET,
            object_name,
            file.file,
            file.size if file.size else -1,
            content_type=file.content_type
        )
        
        # 构建公共URL
        file_url = f"{MINIO_EXTERNAL_URL}/{MINIO_BUCKET}/{object_name}"
        
        return {
            "url": file_url,
            "filename": safe_filename,
            "size": file.size,
            "type": file.content_type,
            "category": file_category
        }
        
    except S3Error as e:
        print(f"MinIO S3 error: {e}")
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    except Exception as e:
        print(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="File upload failed")

@router.post("/presign")
async def get_presigned_url(
    filename: str = Query(...),
    current_user: models.User = Depends(auth.get_current_user)
):
    """获取MinIO预签名URL（用于前端直接上传）"""
    from datetime import timedelta
    import uuid
    
    # Validate file extension
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
    file_ext = '.' + filename.split('.')[-1].lower() if '.' in filename else ''
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file extension")
    
    # Generate object name
    timestamp = datetime.now().strftime("%Y%m%d")
    object_name = f"posts/{current_user.id}/{timestamp}_{uuid.uuid4()}{file_ext}"
    
    if not minio_available or not minio_client:
        raise HTTPException(
            status_code=503, 
            detail="File upload service is not available. Please contact the administrator or configure MinIO storage."
        )
    
    try:
        # Generate presigned URL (valid for 1 hour)
        presigned_url = minio_client.presigned_put_object(
            MINIO_BUCKET,
            object_name,
            expires=timedelta(hours=1)
        )
        
        # Public URL after upload
        public_url = f"{MINIO_EXTERNAL_URL}/{MINIO_BUCKET}/{object_name}"
        
        return {
            "presigned_url": presigned_url,
            "public_url": public_url,
            "object_name": object_name
        }
    except S3Error as e:
        print(f"MinIO S3 error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate presigned URL: {str(e)}")
    except Exception as e:
        print(f"Presign failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate presigned URL")
