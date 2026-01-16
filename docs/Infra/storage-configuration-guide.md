# 存储服务配置指南

现在 `uploads.py` 支持多种存储后端！你可以选择使用免费的云存储服务。

## 🎯 支持的存储后端

1. **MinIO** - 自托管对象存储（需要付费服务）
2. **Supabase Storage** - 免费 1 GB ⭐ 推荐
3. **Cloudinary** - 免费 25 GB/月（图片专用）

## 📋 配置步骤

### 方案 1：Supabase Storage（推荐，免费）

#### 步骤 1：在 Supabase 中创建存储桶

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Storage** → **Buckets**
4. 点击 **New bucket**
5. 填写：
   - **Name**: `memoluck-files`
   - **Public bucket**: ✅ 勾选（允许公开访问）
6. 点击 **Create bucket**

#### 步骤 2：获取 Supabase 配置信息

1. 在 Supabase Dashboard 中，进入 **Settings** → **API**
2. 记录以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`（很长的字符串）

#### 步骤 3：在 Render 后端服务中配置环境变量

在 `memolucky-backend` 服务的 **Environment** 标签中添加：

```
STORAGE_TYPE=supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...（你的 anon public key）
SUPABASE_BUCKET=memoluck-files
```

#### 步骤 4：保存并重新部署

点击 **Save Changes**，Render 会自动重新部署。

---

### 方案 2：Cloudinary（图片专用，免费额度大）

#### 步骤 1：注册 Cloudinary 账号

1. 访问 [Cloudinary](https://cloudinary.com)
2. 注册免费账号

#### 步骤 2：获取 API 密钥

1. 登录 Cloudinary Dashboard
2. 在 Dashboard 首页可以看到：
   - **Cloud name**
   - **API Key**
   - **API Secret**

#### 步骤 3：在 Render 后端服务中配置环境变量

在 `memolucky-backend` 服务的 **Environment** 标签中添加：

```
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=你的cloud_name
CLOUDINARY_API_KEY=你的api_key
CLOUDINARY_API_SECRET=你的api_secret
```

#### 步骤 4：保存并重新部署

点击 **Save Changes**，Render 会自动重新部署。

---

### 方案 3：MinIO（需要付费）

如果你有 Render 付费计划，可以配置 MinIO：

```
STORAGE_TYPE=minio
MINIO_ENDPOINT=memolucky-minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=你的密码
MINIO_BUCKET=memoluck-files
MINIO_EXTERNAL_URL=https://memolucky-minio.onrender.com
MINIO_SECURE=false
```

---

## 🔍 验证配置

### 检查后端日志

部署完成后，查看后端服务的 **Logs**，应该看到：

**Supabase**:
```
Storage backend 'supabase' initialized successfully
```

**Cloudinary**:
```
Storage backend 'cloudinary' initialized successfully
```

**MinIO**:
```
Storage backend 'minio' initialized successfully
```

### 测试上传功能

1. 访问前端应用
2. 尝试上传头像或帖子图片
3. 应该可以成功上传

---

## ⚠️ 常见问题

### 问题 1：上传返回 503 错误

**原因**：存储后端未配置或配置错误

**解决方法**：
1. 检查 `STORAGE_TYPE` 环境变量是否正确设置
2. 检查对应存储服务的环境变量是否完整
3. 查看后端日志中的错误信息

### 问题 2：Supabase 上传失败

**错误信息**：
```
Supabase upload failed: ...
```

**解决方法**：
1. 确认 `SUPABASE_URL` 和 `SUPABASE_KEY` 正确
2. 确认存储桶名称 `SUPABASE_BUCKET` 正确
3. 确认存储桶设置为 **Public bucket**

### 问题 3：Cloudinary 上传失败

**错误信息**：
```
Cloudinary upload failed: ...
```

**解决方法**：
1. 确认 `CLOUDINARY_CLOUD_NAME`、`CLOUDINARY_API_KEY`、`CLOUDINARY_API_SECRET` 都正确
2. 检查 Cloudinary Dashboard 中的 API 密钥是否有效

---

## 📊 方案对比

| 方案 | 免费额度 | 易用性 | 推荐度 | 适用场景 |
|------|---------|--------|--------|----------|
| Supabase Storage | 1 GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 已使用 Supabase 数据库 |
| Cloudinary | 25 GB/月 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 只需要图片存储 |
| MinIO | 无 | ⭐⭐⭐ | ⭐⭐⭐ | 需要完全控制 |

---

## 🎯 推荐配置

**如果你已经在使用 Supabase 数据库**：
→ 使用 **Supabase Storage**（方案 1）

**如果只需要图片存储**：
→ 使用 **Cloudinary**（方案 2）

**如果需要完全控制**：
→ 使用 **MinIO**（方案 3，需要付费）

---

## 📝 环境变量总结

### Supabase Storage
```
STORAGE_TYPE=supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
SUPABASE_BUCKET=memoluck-files
```

### Cloudinary
```
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### MinIO
```
STORAGE_TYPE=minio
MINIO_ENDPOINT=memolucky-minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your_password
MINIO_BUCKET=memoluck-files
MINIO_EXTERNAL_URL=https://memolucky-minio.onrender.com
MINIO_SECURE=false
```

---

配置完成后，上传功能就可以正常使用了！🎉

