# 快速配置存储服务（解决上传失败问题）

## 🔴 问题原因

上传图片和文件失败是因为没有配置存储后端。代码需要存储服务来保存上传的文件。

## ✅ 解决方案：配置 Supabase Storage（推荐，免费）

### 步骤 1：注册 Supabase 账号（免费）

1. 访问 [Supabase](https://supabase.com)
2. 点击 **Start your project**
3. 使用 GitHub 账号登录（推荐）
4. 点击 **New Project**
5. 填写项目信息：
   - **Name**: `memoluck-storage`（任意名称）
   - **Database Password**: 设置一个密码（记录保存）
   - **Region**: 选择离你最近的区域（如 `Southeast Asia (Singapore)`）
6. 点击 **Create new project**（等待 2-3 分钟创建完成）

### 步骤 2：创建存储桶（Bucket）

1. 在 Supabase Dashboard 中，点击左侧 **Storage** 菜单
2. 点击 **New bucket** 按钮
3. 填写信息：
   - **Name**: `memoluck-files`
   - **Public bucket**: ✅ **必须勾选**（这样才能公开访问上传的文件）
4. 点击 **Create bucket**

### 步骤 3：获取 API 密钥

1. 在 Supabase Dashboard 中，点击左侧 **Settings**（⚙️ 图标）
2. 点击 **API** 子菜单
3. 记录以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`（复制完整 URL）
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（点击 👁️ 图标查看，然后复制完整字符串）

### 步骤 4：在 Render 中配置环境变量

1. 打开 Render Dashboard：https://dashboard.render.com
2. 找到你的后端服务 `memolucky-backend`
3. 点击服务名称进入详情页
4. 点击左侧 **Environment** 标签
5. 点击 **Add Environment Variable** 按钮
6. 添加以下 4 个环境变量（一个接一个添加）：

   **变量 1：**
   - **Key**: `STORAGE_TYPE`
   - **Value**: `supabase`

   **变量 2：**
   - **Key**: `SUPABASE_URL`
   - **Value**: `https://xxxxx.supabase.co`（替换为步骤 3 中的 Project URL）

   **变量 3：**
   - **Key**: `SUPABASE_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（替换为步骤 3 中的 anon public key）

   **变量 4：**
   - **Key**: `SUPABASE_BUCKET`
   - **Value**: `memoluck-files`

7. 添加完所有变量后，点击页面右上角的 **Save Changes** 按钮
8. Render 会自动重新部署你的后端服务（约 2-5 分钟）

### 步骤 5：验证配置

1. 等待部署完成后，检查 Render 后端日志
2. 应该看到类似这样的消息：
   ```
   Storage backend 'supabase' initialized successfully
   ```
3. 如果看到错误信息，检查：
   - `SUPABASE_URL` 是否正确（应该是 `https://` 开头）
   - `SUPABASE_KEY` 是否完整（应该是很长的字符串）
   - 存储桶 `memoluck-files` 是否已创建且设置为公开

---

## 🎯 替代方案：Cloudinary（图片专用，免费额度更大）

如果你想要更大的免费额度（25 GB/月），可以使用 Cloudinary：

### 步骤 1：注册 Cloudinary 账号

1. 访问 [Cloudinary](https://cloudinary.com/users/register/free)
2. 填写注册信息并验证邮箱

### 步骤 2：获取 API 密钥

1. 登录 Cloudinary Dashboard
2. 在 Dashboard 首页可以看到：
   - **Cloud name**
   - **API Key**
   - **API Secret**（点击 👁️ 查看）

### 步骤 3：在 Render 中配置环境变量

添加以下 4 个环境变量：

```
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=你的cloud_name
CLOUDINARY_API_KEY=你的api_key
CLOUDINARY_API_SECRET=你的api_secret
```

---

## ❌ 常见错误

### 错误 1：`File upload service is not available`

**原因**：`STORAGE_TYPE` 未设置或设置为 `none`

**解决**：在 Render 中添加 `STORAGE_TYPE=supabase` 或 `STORAGE_TYPE=cloudinary`

### 错误 2：`Supabase credentials not provided`

**原因**：缺少 `SUPABASE_URL` 或 `SUPABASE_KEY`

**解决**：确保在 Render 中设置了所有必需的环境变量

### 错误 3：上传成功但图片无法显示

**原因**：Supabase 存储桶未设置为公开

**解决**：
1. 进入 Supabase Dashboard → Storage → Buckets
2. 点击 `memoluck-files` 存储桶
3. 确保 **Public bucket** 选项已勾选

---

## 📝 验证配置的完整检查清单

- [ ] Supabase 项目已创建
- [ ] 存储桶 `memoluck-files` 已创建且设置为公开
- [ ] 已获取 `SUPABASE_URL`（Project URL）
- [ ] 已获取 `SUPABASE_KEY`（anon public key）
- [ ] 在 Render 中设置了 `STORAGE_TYPE=supabase`
- [ ] 在 Render 中设置了 `SUPABASE_URL`
- [ ] 在 Render 中设置了 `SUPABASE_KEY`
- [ ] 在 Render 中设置了 `SUPABASE_BUCKET=memoluck-files`
- [ ] 已保存更改并等待部署完成
- [ ] Render 日志显示 `Storage backend 'supabase' initialized successfully`

---

## 🎉 配置完成后

配置完成后，以下功能将恢复正常：
- ✅ 上传头像
- ✅ 上传个人主页背景图
- ✅ 上传帖子图片
- ✅ 上传文件附件

如果还有问题，请检查 Render 后端日志中的错误信息。

