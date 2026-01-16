# 上传服务配置说明

## 当前状态

上传功能（头像、背景图、帖子图片）目前**可选**。如果 MinIO 未配置，应用仍可正常运行，但上传功能会返回友好的错误提示。

## 问题说明

### 1. 上传功能返回 500 错误

**原因**：MinIO 服务未配置或不可用

**解决方案**：

#### 选项 A：配置 MinIO（推荐用于生产环境）

1. **在 Render 上创建 MinIO 服务**（或使用其他云存储服务）
   - 访问 [Render Dashboard](https://dashboard.render.com)
   - 创建新的 **Private Service**
   - 使用 Docker 镜像：`minio/minio:latest`
   - 设置环境变量：
     ```
     MINIO_ROOT_USER=your_access_key
     MINIO_ROOT_PASSWORD=your_secret_key
     ```
   - 启动命令：`minio server /data --console-address ":9001"`

2. **在后端服务中配置环境变量**：
   ```
   MINIO_ENDPOINT=your-minio-service.onrender.com:9000
   MINIO_ACCESS_KEY=your_access_key
   MINIO_SECRET_KEY=your_secret_key
   MINIO_BUCKET=memoluck-files
   MINIO_EXTERNAL_URL=https://your-minio-service.onrender.com
   MINIO_SECURE=true  # 如果使用 HTTPS
   ```

#### 选项 B：使用替代云存储服务

可以考虑使用：
- **Supabase Storage**（如果已使用 Supabase）
- **Cloudinary**（图片专用）
- **AWS S3**（需要 AWS 账户）
- **Google Cloud Storage**

需要修改 `backend/app/uploads.py` 以支持这些服务。

#### 选项 C：临时禁用上传功能

如果暂时不需要上传功能，可以：
- 不配置 MinIO 环境变量
- 应用会正常启动，但上传 API 会返回 503 错误
- 前端会显示友好的错误提示

## 修复内容

### 1. MinIO 可选化

- ✅ MinIO 客户端初始化失败不会导致应用崩溃
- ✅ 上传 API 会检查 MinIO 是否可用
- ✅ 如果不可用，返回 503 Service Unavailable 而不是 500 Internal Server Error
- ✅ 提供清晰的错误信息

### 2. 筛选条件修复

**问题**：前端使用 `'book'` 筛选，但数据库存储的是 `'textbook'`

**修复**：
- ✅ 前端筛选按钮改为使用 `'textbook'`
- ✅ 与创建商品时的分类值保持一致

## 验证修复

### 检查上传功能

1. 尝试上传头像或帖子图片
2. 如果 MinIO 未配置，应该看到友好的错误提示（而不是 500 错误）
3. 检查后端日志，应该看到：
   ```
   MinIO credentials not provided. Upload functionality will be disabled.
   ```

### 检查筛选功能

1. 创建一个分类为"教科书"的商品
2. 在商品列表页面点击"教科書"筛选按钮
3. 应该能正确显示所有教科书商品

## 下一步

如果需要启用上传功能：

1. **配置 MinIO 服务**（推荐）
   - 在 Render 上创建 MinIO 服务
   - 配置环境变量
   - 重启后端服务

2. **或使用替代存储服务**
   - 修改 `backend/app/uploads.py` 以支持其他存储服务
   - 更新环境变量配置

## 注意事项

- MinIO 在 Render 的免费计划中可能有限制
- 考虑使用 Render 的 Persistent Disk 来存储文件
- 或者使用专门的云存储服务（如 Supabase Storage）

