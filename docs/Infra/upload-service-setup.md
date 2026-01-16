# 上传服务配置说明

## 当前状态

上传功能（头像、背景图、帖子图片）目前**可选**。如果 MinIO 未配置，应用仍可正常运行，但上传功能会返回友好的错误提示。

## 问题说明

### 1. 上传功能返回 500 错误

**原因**：MinIO 服务未配置或不可用

**解决方案**：

#### 选项 A：配置 MinIO（免费计划）

**重要提示**：Render 免费计划的服务会在不活动时休眠，这会影响 MinIO 的可用性。但对于学习和测试，这是可行的方案。

##### 步骤 1：在 Render 上创建 MinIO 服务

1. **访问 Render Dashboard**
   - 前往 [Render Dashboard](https://dashboard.render.com)
   - 点击 **New** → **Private Service**

2. **基本配置**
   - **Name**: `memolucky-minio`（或任何你喜欢的名称）
   - **Language**: `Docker`
   - **Branch**: `main`
   - **Region**: `Singapore (Southeast Asia)`（与后端服务同一区域）
   - **Instance Type**: `Free`（免费计划）

3. **Docker 配置**
   - **Dockerfile Path**: `minio/Dockerfile`
   - **Docker Command**: （留空，使用 Dockerfile 中的 CMD）

4. **环境变量**（点击 Add Environment Variable）
   ```
   MINIO_ROOT_USER=minioadmin
   MINIO_ROOT_PASSWORD=[生成一个强密码，例如：Memoluck2024!Secure]
   ```
   
   **生成密码的方法**：
   - 使用在线工具：https://www.random.org/passwords/
   - 或使用 PowerShell：`-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 16 | % {[char]$_})`

5. **持久化存储（Disk）**
   - 点击 **Add disk**
   - **Name**: `minio-data`
   - **Mount Path**: `/data`
   - **Size**: `1 GB`（免费计划可能不支持，如果无法添加，可以跳过）
   - ⚠️ **注意**：免费计划可能不支持持久化磁盘，数据可能会在服务重启后丢失

6. **其他设置**
   - **Auto-Deploy**: `On Commit`（保持默认）
   - 点击 **Create Private Service**

##### 步骤 2：获取 MinIO 服务地址

部署完成后，在 Render Dashboard 中：
1. 找到你的 MinIO 服务
2. 查看服务详情
3. 找到 **Internal URL**（内网地址，格式类似：`memolucky-minio:9000`）
4. 找到 **Public URL**（如果有，格式类似：`https://memolucky-minio.onrender.com`）

##### 步骤 3：在后端服务中配置环境变量

1. 在 Render Dashboard 中找到你的后端服务（`memolucky-backend`）
2. 进入 **Environment** 标签
3. 添加以下环境变量：

   ```
   MINIO_ENDPOINT=memolucky-minio:9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=[你刚才设置的 MINIO_ROOT_PASSWORD]
   MINIO_BUCKET=memoluck-files
   MINIO_EXTERNAL_URL=https://memolucky-minio.onrender.com
   MINIO_SECURE=false
   ```

   **说明**：
   - `MINIO_ENDPOINT`：使用内网地址（格式：`服务名:9000`）
   - `MINIO_ACCESS_KEY`：与 `MINIO_ROOT_USER` 相同
   - `MINIO_SECRET_KEY`：与 `MINIO_ROOT_PASSWORD` 相同
   - `MINIO_EXTERNAL_URL`：如果 MinIO 有公网地址，使用公网地址；否则使用内网地址
   - `MINIO_SECURE`：如果使用 HTTPS，设置为 `true`；否则 `false`

4. 点击 **Save Changes**
5. Render 会自动重新部署后端服务

##### 步骤 4：验证配置

1. 等待后端服务重新部署完成
2. 检查后端日志，应该看到：
   ```
   MinIO connected successfully to memolucky-minio:9000/memoluck-files
   ```
3. 尝试在前端上传图片，应该可以成功

##### 免费计划的限制

⚠️ **重要提示**：
- **服务休眠**：免费计划的服务在 15 分钟不活动后会休眠，首次访问需要等待 30-60 秒唤醒
- **无持久化存储**：免费计划不支持持久化磁盘，数据可能在服务重启后丢失
- **性能限制**：免费计划有 CPU 和内存限制，可能影响上传速度

**建议**：
- 如果只是学习和测试，免费计划可以使用
- 如果需要生产环境，建议升级到付费计划（Starter $7/月）

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

