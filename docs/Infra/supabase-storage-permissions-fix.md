# Supabase Storage 权限配置指南（修复 RLS 策略错误）

## 🔴 问题

上传文件时出现错误：
```
"new row violates row-level security policy"
```

这是因为 Supabase Storage 的 Row Level Security (RLS) 策略阻止了上传。

---

## ✅ 解决方案

### 方法 1：在 Supabase Dashboard 中配置存储桶权限（推荐）

#### 步骤 1：登录 Supabase Dashboard

1. 访问：https://app.supabase.com
2. 登录并选择你的项目

#### 步骤 2：确保存储桶是公开的

1. 进入 **Storage** → **Buckets**
2. 找到 `memoluck-files` 存储桶
3. 点击存储桶名称进入详情页
4. 确认 **Public bucket** 选项已勾选 ✅
5. 如果没有勾选，勾选并保存

#### 步骤 3：配置存储策略（Policy）

1. 在存储桶详情页面，点击 **Policies** 标签
2. 点击 **New Policy** 按钮
3. 选择 **For full customization**（完全自定义）

4. **策略 1：允许公开读取（SELECT）**
   - **Policy name**: `Allow public read`
   - **Allowed operation**: `SELECT` (read)
   - **Target roles**: `public`, `anon`, `authenticated`
   - **USING expression**: `true`（允许所有人读取）
   - **WITH CHECK expression**: `true`
   - 点击 **Review** → **Save policy**

5. **策略 2：允许上传（INSERT）**
   - **Policy name**: `Allow authenticated upload`
   - **Allowed operation**: `INSERT` (upload)
   - **Target roles**: `authenticated` 或 `public`（如果需要匿名上传）
   - **USING expression**: `true`
   - **WITH CHECK expression**: `true`
   - 点击 **Review** → **Save policy**

6. **策略 3：允许更新（UPDATE）**（可选）
   - **Policy name**: `Allow authenticated update`
   - **Allowed operation**: `UPDATE`
   - **Target roles**: `authenticated` 或 `public`
   - **USING expression**: `true`
   - **WITH CHECK expression**: `true`
   - 点击 **Review** → **Save policy**

7. **策略 4：允许删除（DELETE）**（可选）
   - **Policy name**: `Allow authenticated delete`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated` 或 `public`
   - **USING expression**: `true`
   - **WITH CHECK expression**: `true`
   - 点击 **Review** → **Save policy**

#### 步骤 4：验证配置

完成后，你应该看到 4 个策略（或至少 SELECT 和 INSERT）：

- ✅ Allow public read (SELECT)
- ✅ Allow authenticated upload (INSERT)
- ✅ Allow authenticated update (UPDATE)（可选）
- ✅ Allow authenticated delete (DELETE)（可选）

---

### 方法 2：使用 SQL Editor 快速配置（高级）

如果你想快速配置所有权限，可以使用 SQL：

1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 点击 **New query**
3. 粘贴以下 SQL（将 `memoluck-files` 替换为你的存储桶名称）：

```sql
-- 允许公开读取
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'memoluck-files');

-- 允许公开上传（如果需要匿名上传，使用 public；如果只允许认证用户，使用 authenticated）
CREATE POLICY "Allow public upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'memoluck-files');

-- 允许公开更新（可选）
CREATE POLICY "Allow public update"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'memoluck-files')
WITH CHECK (bucket_id = 'memoluck-files');

-- 允许公开删除（可选）
CREATE POLICY "Allow public delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'memoluck-files');
```

4. 点击 **Run** 执行 SQL
5. 完成后，重新尝试上传

---

### 方法 3：使用 Service Role Key（不推荐，安全性较低）

**注意**：这种方法会绕过 RLS 策略，存在安全风险。仅在测试时使用。

如果你需要在测试时快速验证上传功能，可以使用 Service Role Key：

1. 在 Supabase Dashboard → **Settings** → **API**
2. 找到 **service_role key**（**不要**在生产环境的前端使用此 key）
3. 在 Render 环境变量中，临时将 `SUPABASE_KEY` 设置为 service_role key（而不是 anon key）

**⚠️ 重要**：
- Service Role Key 拥有完全权限，会绕过所有 RLS 策略
- **不要**在前端代码中暴露 Service Role Key
- 仅用于后端服务之间的通信
- 生产环境建议使用方法 1 或方法 2 正确配置 RLS 策略

---

## 📋 配置检查清单

完成后，确认以下所有项：

- [ ] 存储桶 `memoluck-files` 已创建
- [ ] 存储桶设置为 **Public**（公开）
- [ ] 已创建至少 2 个策略：
  - [ ] SELECT 策略（允许读取）
  - [ ] INSERT 策略（允许上传）
- [ ] 策略中的 `bucket_id` 设置为 `'memoluck-files'`
- [ ] 策略的目标角色包含 `public` 或 `authenticated`
- [ ] 在 Render 中使用的 `SUPABASE_KEY` 是 **anon public key**（不是 service_role key）

---

## 🔍 验证配置

配置完成后：

1. 等待 1-2 分钟让策略生效
2. 尝试上传图片
3. 如果仍然失败，检查 Render 日志中的错误信息
4. 确认错误不再是 `"new row violates row-level security policy"`

---

## 💡 常见问题

### Q: 为什么需要这些策略？

**A**: Supabase Storage 默认启用 Row Level Security (RLS)，即使存储桶设置为 Public，也需要明确配置策略来允许读取、上传等操作。

### Q: `public` 和 `authenticated` 有什么区别？

**A**:
- **`public`**: 允许任何人（包括未登录用户）执行操作
- **`authenticated`**: 只允许已登录用户执行操作

对于公开存储桶，通常使用 `public`。对于需要认证的存储桶，使用 `authenticated`。

### Q: 配置完成后仍然失败？

**A**: 
1. 等待 1-2 分钟让策略生效
2. 确认策略中的 `bucket_id` 正确
3. 确认使用的是 **anon public key**（不是 service_role key）
4. 检查 Supabase Dashboard 中的策略列表，确认策略已创建

---

配置完成后，上传功能应该可以正常工作了！

