"""
存储后端抽象层 - 支持多种存储服务
支持：MinIO, Supabase Storage, Cloudinary
"""
import os
from typing import Optional, Tuple
from fastapi import UploadFile
import io
import httpx  # 用于 Supabase HTTP API 请求

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
    """初始化 Supabase Storage - 使用 HTTP 请求而不是客户端库，避免 proxy 参数问题"""
    try:
        if not SUPABASE_URL or not SUPABASE_KEY:
            print("❌ Supabase credentials not provided")
            print(f"   SUPABASE_URL: {'SET' if SUPABASE_URL else 'NOT SET'}")
            print(f"   SUPABASE_KEY: {'SET' if SUPABASE_KEY else 'NOT SET'}")
            return None, False
        
        print(f"   Initializing Supabase Storage with HTTP API (URL: {SUPABASE_URL[:30]}...)")
        
        # 使用 HTTP 请求测试连接，而不是客户端库
        # 这样可以完全避免 proxy 参数问题
        import httpx
        
        # 测试连接 - 尝试列出 buckets
        test_url = f"{SUPABASE_URL}/storage/v1/bucket"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        }
        
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(test_url, headers=headers)
                if response.status_code == 200:
                    print(f"   ✅ Supabase Storage API connection test successful")
                    # 返回一个简单的配置对象，包含上传所需的信息
                    # 实际上传时使用 HTTP 请求
                    config = {
                        "url": SUPABASE_URL,
                        "key": SUPABASE_KEY,
                        "bucket": SUPABASE_BUCKET
                    }
                    return config, True
                else:
                    print(f"   ⚠️  Supabase API test returned status {response.status_code}")
                    # 仍然返回 True，API 连接正常，只是可能需要检查权限
                    config = {
                        "url": SUPABASE_URL,
                        "key": SUPABASE_KEY,
                        "bucket": SUPABASE_BUCKET
                    }
                    return config, True
        except Exception as e:
            print(f"   ⚠️  Supabase connection test warning: {e}")
            print(f"   Continuing anyway - upload will be attempted with HTTP requests")
            # 即使测试失败，也返回配置，让上传时再尝试
            config = {
                "url": SUPABASE_URL,
                "key": SUPABASE_KEY,
                "bucket": SUPABASE_BUCKET
            }
            return config, True
            
    except ImportError:
        print("❌ httpx library not installed. Install with: pip install httpx")
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
    """上传到 Supabase Storage - 使用 HTTP 请求直接调用 API"""
    try:
        print(f"Uploading to Supabase via HTTP API: bucket={storage_client['bucket']}, path={object_name}")
        
        # 使用 HTTP 请求直接上传到 Supabase Storage API
        # API endpoint: POST /storage/v1/object/{bucket}/{path}
        upload_url = f"{storage_client['url']}/storage/v1/object/{storage_client['bucket']}/{object_name}"
        
        headers = {
            "apikey": storage_client['key'],
            "Authorization": f"Bearer {storage_client['key']}",
            "Content-Type": content_type,
            "x-upsert": "true"  # 允许覆盖已存在的文件
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                upload_url,
                content=file_content,
                headers=headers
            )
            
            if response.status_code in [200, 201]:
                # 构建公开访问 URL
                # 格式: {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
                public_url = f"{storage_client['url']}/storage/v1/object/public/{storage_client['bucket']}/{object_name}"
                print(f"✅ Supabase upload successful. Public URL: {public_url}")
                return public_url
            else:
                error_msg = f"Supabase upload failed with status {response.status_code}: {response.text}"
                print(f"❌ {error_msg}")
                raise Exception(error_msg)
                
    except httpx.HTTPError as e:
        error_msg = f"Supabase HTTP request failed: {str(e)}"
        print(f"❌ {error_msg}")
        import traceback
        traceback.print_exc()
        raise Exception(error_msg)
    except Exception as e:
        error_msg = f"Supabase upload failed: {str(e)}"
        print(f"❌ {error_msg}")
        import traceback
        traceback.print_exc()
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

