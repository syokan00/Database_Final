"""
存储后端抽象层 - 支持多种存储服务
支持：MinIO, Supabase Storage, Cloudinary
"""
import os
from typing import Optional, Tuple
from fastapi import UploadFile
import io

# 存储类型
STORAGE_TYPE = os.getenv("STORAGE_TYPE", "none").lower()  # minio, supabase, cloudinary, none

# MinIO 配置
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "memoluck-files")
MINIO_SECURE = os.getenv("MINIO_SECURE", "false").lower() == "true"
MINIO_EXTERNAL_URL = os.getenv("MINIO_EXTERNAL_URL", "http://localhost:9002")

# Supabase Storage 配置
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "memoluck-files")

# Cloudinary 配置
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# 存储客户端
storage_client = None
storage_available = False
storage_type_used = None


def init_storage():
    """初始化存储后端"""
    global storage_client, storage_available, storage_type_used
    
    print(f"=== Storage Initialization ===")
    print(f"STORAGE_TYPE environment variable: '{STORAGE_TYPE}'")
    
    if STORAGE_TYPE == "minio":
        print("Attempting to initialize MinIO storage...")
        storage_client, storage_available = _init_minio()
        if storage_available:
            storage_type_used = "minio"
    elif STORAGE_TYPE == "supabase":
        print("Attempting to initialize Supabase storage...")
        print(f"SUPABASE_URL: {'SET' if SUPABASE_URL else 'NOT SET'}")
        print(f"SUPABASE_KEY: {'SET (length: ' + str(len(SUPABASE_KEY)) + ')' if SUPABASE_KEY else 'NOT SET'}")
        print(f"SUPABASE_BUCKET: '{SUPABASE_BUCKET}'")
        storage_client, storage_available = _init_supabase()
        if storage_available:
            storage_type_used = "supabase"
    elif STORAGE_TYPE == "cloudinary":
        print("Attempting to initialize Cloudinary storage...")
        storage_client, storage_available = _init_cloudinary()
        if storage_available:
            storage_type_used = "cloudinary"
    else:
        print(f"⚠️  No storage backend configured. STORAGE_TYPE='{STORAGE_TYPE}' (expected: minio, supabase, or cloudinary)")
        print("Upload functionality will be disabled.")
        print("To enable uploads, set STORAGE_TYPE environment variable to one of: minio, supabase, cloudinary")
        storage_available = False
    
    print(f"=== Storage Initialization Result ===")
    if storage_available:
        print(f"✅ Storage backend '{storage_type_used}' initialized successfully")
    else:
        print("❌ Storage backend initialization failed. Upload functionality will be disabled.")
    print(f"storage_available = {storage_available}")


def _init_minio() -> Tuple[Optional[object], bool]:
    """初始化 MinIO"""
    try:
        from minio import Minio
        from minio.error import S3Error
        
        if not MINIO_ACCESS_KEY or not MINIO_SECRET_KEY:
            print("MinIO credentials not provided")
            return None, False
        
        client = Minio(
            MINIO_ENDPOINT,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=MINIO_SECURE
        )
        
        # 测试连接
        if client.bucket_exists(MINIO_BUCKET):
            return client, True
        else:
            # 尝试创建 bucket
            try:
                client.make_bucket(MINIO_BUCKET)
                policy = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}' % MINIO_BUCKET
                client.set_bucket_policy(MINIO_BUCKET, policy)
                return client, True
            except Exception as e:
                print(f"MinIO bucket creation failed: {e}")
                return None, False
    except Exception as e:
        print(f"MinIO initialization failed: {e}")
        return None, False


def _init_supabase() -> Tuple[Optional[object], bool]:
    """初始化 Supabase Storage"""
    try:
        from supabase import create_client, Client
        
        if not SUPABASE_URL or not SUPABASE_KEY:
            print("❌ Supabase credentials not provided")
            print(f"   SUPABASE_URL: {'SET' if SUPABASE_URL else 'NOT SET'}")
            print(f"   SUPABASE_KEY: {'SET' if SUPABASE_KEY else 'NOT SET'}")
            return None, False
        
        print(f"   Creating Supabase client with URL: {SUPABASE_URL[:30]}...")
        # Use create_client with explicit options to avoid proxy parameter issue
        # Some versions have issues with proxy parameter being passed incorrectly
        try:
            # Try standard create_client first
            client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("   Supabase client created successfully")
        except TypeError as e:
            if "proxy" in str(e).lower():
                print(f"   ⚠️  proxy parameter error detected: {e}")
                print("   Attempting workaround: creating client with ClientOptions...")
                # Workaround: Use Client directly with ClientOptions
                from supabase.client import Client, ClientOptions
                options = ClientOptions(
                    schema="public",
                    auto_refresh_token=False,
                    persist_session=False,
                    local_storage=None,
                    headers=None,
                )
                client = Client(
                    supabase_url=SUPABASE_URL,
                    supabase_key=SUPABASE_KEY,
                    options=options
                )
                print("   Supabase client created successfully (using workaround)")
            else:
                raise
        
        # 测试连接 - 尝试列出 buckets
        try:
            print("   Testing Supabase connection by listing buckets...")
            buckets = client.storage.list_buckets()
            print(f"   ✅ Supabase connection test successful. Found {len(buckets)} bucket(s)")
            
            # 检查目标 bucket 是否存在
            bucket_names = [b.name for b in buckets] if buckets else []
            if SUPABASE_BUCKET not in bucket_names:
                print(f"   ⚠️  Warning: Bucket '{SUPABASE_BUCKET}' not found in Supabase.")
                print(f"   Available buckets: {bucket_names}")
                print(f"   Please create the bucket '{SUPABASE_BUCKET}' in Supabase Dashboard")
                # 仍然返回 True，因为连接是成功的，只是 bucket 可能不存在
                # 上传时会失败，但至少我们知道连接是好的
            
            return client, True
        except Exception as e:
            print(f"   ❌ Supabase connection test failed: {e}")
            print(f"   Error type: {type(e).__name__}")
            import traceback
            print(f"   Traceback: {traceback.format_exc()}")
            return None, False
    except ImportError:
        print("❌ Supabase library not installed. Install with: pip install supabase")
        return None, False
    except Exception as e:
        print(f"❌ Supabase initialization failed: {e}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        print(f"   Traceback: {traceback.format_exc()}")
        return None, False


def _init_cloudinary() -> Tuple[Optional[object], bool]:
    """初始化 Cloudinary"""
    try:
        import cloudinary
        import cloudinary.uploader
        
        if not CLOUDINARY_CLOUD_NAME or not CLOUDINARY_API_KEY or not CLOUDINARY_API_SECRET:
            print("Cloudinary credentials not provided")
            return None, False
        
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET
        )
        
        # 测试连接 - 上传一个测试文件
        return cloudinary, True
    except ImportError:
        print("Cloudinary library not installed. Install with: pip install cloudinary")
        return None, False
    except Exception as e:
        print(f"Cloudinary initialization failed: {e}")
        return None, False


async def upload_file(file: UploadFile, object_name: str, content_type: str) -> str:
    """
    上传文件到存储后端
    返回文件的公开访问 URL
    """
    if not storage_available or not storage_client:
        error_msg = f"Storage backend is not available. STORAGE_TYPE={STORAGE_TYPE}, storage_available={storage_available}"
        print(error_msg)
        raise Exception(error_msg)
    
    # 保存文件名（在读取前）
    filename = file.filename or "file"
    
    # 读取文件内容
    file_content = await file.read()
    file_size = len(file_content)
    
    print(f"Uploading file: {filename}, size: {file_size} bytes, type: {storage_type_used}")
    
    try:
        if storage_type_used == "minio":
            return await _upload_to_minio(file_content, object_name, content_type, file_size)
        elif storage_type_used == "supabase":
            return await _upload_to_supabase(file_content, object_name, content_type)
        elif storage_type_used == "cloudinary":
            return await _upload_to_cloudinary(file_content, object_name, content_type, filename)
        else:
            raise Exception(f"Unknown storage type: {storage_type_used}")
    except Exception as e:
        print(f"Upload error in storage layer: {e}")
        raise


async def _upload_to_minio(file_content: bytes, object_name: str, content_type: str, file_size: int) -> str:
    """上传到 MinIO"""
    from minio.error import S3Error
    
    try:
        file_obj = io.BytesIO(file_content)
        storage_client.put_object(
            MINIO_BUCKET,
            object_name,
            file_obj,
            file_size,
            content_type=content_type
        )
        return f"{MINIO_EXTERNAL_URL}/{MINIO_BUCKET}/{object_name}"
    except S3Error as e:
        raise Exception(f"MinIO upload failed: {str(e)}")


async def _upload_to_supabase(file_content: bytes, object_name: str, content_type: str) -> str:
    """上传到 Supabase Storage"""
    try:
        print(f"Uploading to Supabase: bucket={SUPABASE_BUCKET}, path={object_name}")
        
        # Supabase Storage 上传
        # upload 方法的参数：path, file, file_options
        response = storage_client.storage.from_(SUPABASE_BUCKET).upload(
            object_name,
            file_content,
            file_options={"content-type": content_type, "upsert": "true"}
        )
        
        print(f"Supabase upload response: {response}")
        
        # 获取公开 URL
        public_url = storage_client.storage.from_(SUPABASE_BUCKET).get_public_url(object_name)
        print(f"Supabase public URL: {public_url}")
        return public_url
    except Exception as e:
        error_msg = f"Supabase upload failed: {str(e)}"
        print(error_msg)
        raise Exception(error_msg)


async def _upload_to_cloudinary(file_content: bytes, object_name: str, content_type: str, filename: str) -> str:
    """上传到 Cloudinary"""
    import cloudinary.uploader
    
    try:
        # 确定资源类型
        resource_type = "image" if content_type.startswith("image/") else "raw"
        
        # 上传到 Cloudinary
        upload_result = cloudinary.uploader.upload(
            file_content,
            public_id=object_name.replace("/", "_"),  # Cloudinary 使用 _ 而不是 /
            resource_type=resource_type,
            folder="memoluck"  # 可选：使用文件夹组织
        )
        
        return upload_result["secure_url"]  # 返回 HTTPS URL
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")


# 初始化存储
init_storage()

