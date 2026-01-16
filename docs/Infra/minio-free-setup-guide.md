# MinIO 免费计划配置指南

## 📋 快速配置清单

### 1. 创建 MinIO 服务

在 Render Dashboard 创建 **Private Service**：

```
Name: memolucky-minio
Language: Docker
Branch: main
Region: Singapore (Southeast Asia)
Instance Type: Free

Dockerfile Path: minio/Dockerfile
Docker Command: (留空)

Environment Variables:
  MINIO_ROOT_USER: minioadmin
  MINIO_ROOT_PASSWORD: [你的强密码]

Disk: (免费计划可能不支持，跳过)
```

### 2. 配置后端服务

在后端服务（`memolucky-backend`）的环境变量中添加：

```
MINIO_ENDPOINT=memolucky-minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=[与 MINIO_ROOT_PASSWORD 相同]
MINIO_BUCKET=memoluck-files
MINIO_EXTERNAL_URL=https://memolucky-minio.onrender.com
MINIO_SECURE=false
```

## 🔧 详细步骤

### 步骤 1：创建 MinIO 服务

1. 登录 [Render Dashboard](https://dashboard.render.com)
2. 点击 **New** → **Private Service**
3. 连接你的 GitHub 仓库：`syokan00/Database_Final`
4. 填写配置：

   **基本设置**：
   - Name: `memolucky-minio`
   - Language: `Docker`
   - Branch: `main`
   - Region: `Singapore (Southeast Asia)`
   - Instance Type: `Free`

   **Docker 设置**：
   - Dockerfile Path: `minio/Dockerfile`
   - Docker Command: （留空）

   **环境变量**：
   - 点击 **Add Environment Variable**
   - `MINIO_ROOT_USER` = `minioadmin`
   - `MINIO_ROOT_PASSWORD` = `[生成强密码]`

   **生成密码的方法**：
   ```powershell
   # PowerShell
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | % {[char]$_})
   ```
   
   或使用在线工具：https://www.random.org/passwords/

5. 点击 **Create Private Service**
6. 等待部署完成（约 2-5 分钟）

### 步骤 2：获取服务地址

部署完成后：

1. 在 Render Dashboard 中找到 `memolucky-minio` 服务
2. 查看服务详情页面
3. 找到 **Internal URL**（内网地址）
   - 格式：`memolucky-minio:9000`
   - 这个地址用于后端服务连接

4. 如果有 **Public URL**，记录下来
   - 格式：`https://memolucky-minio-xxxx.onrender.com`
   - 用于外部访问（如果有）

### 步骤 3：配置后端服务

1. 在 Render Dashboard 中找到后端服务（`memolucky-backend`）
2. 进入 **Environment** 标签
3. 点击 **Add Environment Variable**，添加：

   ```
   MINIO_ENDPOINT=memolucky-minio:9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=[你刚才设置的 MINIO_ROOT_PASSWORD]
   MINIO_BUCKET=memoluck-files
   MINIO_EXTERNAL_URL=https://memolucky-minio-xxxx.onrender.com
   MINIO_SECURE=false
   ```

   **重要**：
   - `MINIO_ENDPOINT` 必须使用内网地址（格式：`服务名:9000`）
   - `MINIO_ACCESS_KEY` 和 `MINIO_SECRET_KEY` 必须与 MinIO 服务的环境变量匹配
   - 如果 MinIO 没有公网地址，`MINIO_EXTERNAL_URL` 可以使用内网地址

4. 点击 **Save Changes**
5. Render 会自动重新部署后端服务

### 步骤 4：验证配置

1. **检查后端日志**：
   - 进入后端服务的 **Logs** 标签
   - 应该看到：
     ```
     MinIO connected successfully to memolucky-minio:9000/memoluck-files
     ```

2. **测试上传功能**：
   - 访问前端应用
   - 尝试上传头像或帖子图片
   - 应该可以成功上传

3. **如果失败，检查**：
   - MinIO 服务是否正常运行
   - 环境变量是否正确配置
   - 后端日志中的错误信息

## ⚠️ 免费计划的限制

### 1. 服务休眠

- **问题**：免费计划的服务在 15 分钟不活动后会休眠
- **影响**：首次访问需要等待 30-60 秒唤醒服务
- **解决**：可以设置定期访问来保持服务活跃（使用 cron job 或监控服务）

### 2. 无持久化存储

- **问题**：免费计划不支持持久化磁盘
- **影响**：服务重启后，上传的文件可能会丢失
- **解决**：
  - 对于学习和测试，可以接受
  - 对于生产环境，建议升级到付费计划

### 3. 性能限制

- **问题**：免费计划有 CPU 和内存限制
- **影响**：上传大文件时可能较慢
- **解决**：限制上传文件大小（已在代码中设置为 5MB）

## 🔍 故障排除

### 问题 1：后端无法连接 MinIO

**错误信息**：
```
MinIO bucket check failed: Connection refused
```

**解决方法**：
1. 检查 `MINIO_ENDPOINT` 是否使用内网地址（格式：`服务名:9000`）
2. 确保 MinIO 服务正在运行
3. 检查两个服务是否在同一区域（Region）

### 问题 2：上传返回 503 错误

**错误信息**：
```
File upload service is not available
```

**解决方法**：
1. 检查后端服务的环境变量是否正确配置
2. 检查 MinIO 服务是否正常运行
3. 查看后端日志中的详细错误信息

### 问题 3：文件上传后无法访问

**原因**：`MINIO_EXTERNAL_URL` 配置错误

**解决方法**：
1. 检查 MinIO 服务是否有公网地址
2. 如果有，使用公网地址
3. 如果没有，可能需要配置反向代理或使用其他存储方案

## 📝 总结

免费计划可以用于：
- ✅ 学习和测试
- ✅ 开发环境
- ✅ 小型项目演示

不适合用于：
- ❌ 生产环境（数据可能丢失）
- ❌ 需要高可用性的应用
- ❌ 需要存储大量文件的场景

**建议**：如果项目需要正式上线，考虑升级到付费计划（Starter $7/月）或使用其他云存储服务。

