# 上传功能故障排除指南

## 🔍 检查步骤

### 步骤 1：检查后端日志

在 Render Dashboard 中查看后端服务的 **Logs**，查找以下信息：

#### 如果看到：
```
No storage backend configured. Upload functionality will be disabled.
To enable uploads, set STORAGE_TYPE to one of: minio, supabase, cloudinary
```

**问题**：没有配置存储后端

**解决方法**：在 Render 后端服务的环境变量中添加 `STORAGE_TYPE`

---

#### 如果看到：
```
Supabase credentials not provided
```
或
```
Cloudinary credentials not provided
```

**问题**：存储服务的凭证未配置

**解决方法**：检查并添加对应的环境变量（见下方配置清单）

---

#### 如果看到：
```
Storage backend 'supabase' initialized successfully
```
或
```
Storage backend 'cloudinary' initialized successfully
```

**说明**：存储后端已正确初始化，继续检查其他问题

---

### 步骤 2：检查环境变量

在 Render Dashboard 中，进入后端服务的 **Environment** 标签，确认以下变量：

#### Supabase Storage 配置
```
STORAGE_TYPE=supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...
SUPABASE_BUCKET=memoluck-files
```

#### Cloudinary 配置
```
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=你的cloud_name
CLOUDINARY_API_KEY=你的api_key
CLOUDINARY_API_SECRET=你的api_secret
```

---

### 步骤 3：测试上传

1. **尝试上传头像**
   - 访问个人资料页面
   - 点击上传头像
   - 查看浏览器控制台的错误信息

2. **查看后端日志**
   - 在 Render Dashboard 中查看实时日志
   - 查找错误信息

---

## 🐛 常见错误及解决方法

### 错误 1：503 Service Unavailable

**错误信息**：
```
File upload service is not available. Please configure storage backend...
```

**原因**：
- `STORAGE_TYPE` 环境变量未设置
- 存储后端初始化失败

**解决方法**：
1. 检查 `STORAGE_TYPE` 是否设置
2. 检查对应的存储服务环境变量是否完整
3. 查看后端日志中的详细错误信息

---

### 错误 2：Supabase 上传失败

**错误信息**：
```
Supabase upload failed: ...
```

**可能原因**：
1. **存储桶不存在**
   - 解决方法：在 Supabase Dashboard 中创建存储桶

2. **存储桶不是公开的**
   - 解决方法：在 Supabase Dashboard 中，将存储桶设置为 **Public bucket**

3. **API 密钥错误**
   - 解决方法：检查 `SUPABASE_KEY` 是否正确（应该是 anon public key）

4. **URL 错误**
   - 解决方法：检查 `SUPABASE_URL` 格式是否正确（应该是 `https://xxxxx.supabase.co`）

---

### 错误 3：Cloudinary 上传失败

**错误信息**：
```
Cloudinary upload failed: ...
```

**可能原因**：
1. **API 密钥错误**
   - 解决方法：检查 `CLOUDINARY_CLOUD_NAME`、`CLOUDINARY_API_KEY`、`CLOUDINARY_API_SECRET` 是否正确

2. **账户限制**
   - 解决方法：检查 Cloudinary Dashboard 中的使用量和限制

---

### 错误 4：文件大小超限

**错误信息**：
```
File size exceeds 5MB limit
```

**解决方法**：
- 头像：最大 5MB
- 背景图：最大 10MB
- 帖子图片：最大 5MB
- 其他文件：根据类型不同，最大 10-50MB

---

## 🔧 快速诊断命令

### 检查存储后端状态

在后端日志中查找：
```
Storage backend 'xxx' initialized successfully
```

如果看到这个，说明存储后端已正确初始化。

### 检查上传请求

在后端日志中查找：
```
Starting avatar upload for user X, object_name: ...
```

如果看到这个，说明上传请求已到达后端。

---

## 📝 配置检查清单

### Supabase Storage
- [ ] `STORAGE_TYPE=supabase` 已设置
- [ ] `SUPABASE_URL` 已设置（格式：`https://xxxxx.supabase.co`）
- [ ] `SUPABASE_KEY` 已设置（anon public key）
- [ ] `SUPABASE_BUCKET` 已设置（默认：`memoluck-files`）
- [ ] 在 Supabase Dashboard 中已创建存储桶
- [ ] 存储桶已设置为 **Public bucket**

### Cloudinary
- [ ] `STORAGE_TYPE=cloudinary` 已设置
- [ ] `CLOUDINARY_CLOUD_NAME` 已设置
- [ ] `CLOUDINARY_API_KEY` 已设置
- [ ] `CLOUDINARY_API_SECRET` 已设置
- [ ] Cloudinary 账户已激活

---

## 🆘 仍然无法解决？

1. **查看完整的后端日志**
   - 在 Render Dashboard 中查看所有日志
   - 查找包含 "upload"、"storage"、"error" 的行

2. **检查前端控制台**
   - 打开浏览器开发者工具
   - 查看 Network 标签中的请求和响应
   - 查看 Console 标签中的错误信息

3. **提供以下信息**：
   - 后端日志中的错误信息
   - 浏览器控制台中的错误信息
   - 你配置的环境变量（隐藏敏感信息）

---

## ✅ 成功标志

如果配置正确，你应该看到：

1. **后端日志**：
   ```
   Storage backend 'supabase' initialized successfully
   Starting post image upload for user X, object_name: ...
   Post image upload successful, URL: https://...
   ```

2. **前端**：
   - 上传成功，图片正常显示
   - 没有错误提示

3. **数据库**：
   - 用户头像 URL 已更新
   - 帖子图片 URL 已保存

