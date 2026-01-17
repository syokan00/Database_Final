# 存储配置故障排查指南

## 🔍 问题诊断

如果你已经配置了环境变量但仍然看到 `503 Service Unavailable`，请按照以下步骤排查：

---

## 步骤 1：检查 Render 环境变量

### 在 Render 中验证环境变量：

1. 打开 Render Dashboard：https://dashboard.render.com
2. 进入 `memolucky-backend` 服务
3. 点击 **Environment** 标签
4. **确认以下 4 个环境变量都已添加且值正确**：

```
STORAGE_TYPE=supabase
SUPABASE_URL=https://xxxxx.supabase.co（完整的 Project URL，必须以 https:// 开头）
SUPABASE_KEY=eyJhbGc...（完整的 anon public key，很长的字符串）
SUPABASE_BUCKET=memoluck-files
```

### 常见问题：

❌ **问题 1：环境变量名称拼写错误**
- ✅ 正确：`STORAGE_TYPE`（全部大写，下划线分隔）
- ❌ 错误：`storage_type`、`STORAGE-TYPE`、`StorageType`

❌ **问题 2：值有额外空格**
- ✅ 正确：`supabase`（没有前后空格）
- ❌ 错误：` supabase `、`supabase `、` supabase`

❌ **问题 3：SUPABASE_URL 格式错误**
- ✅ 正确：`https://xxxxx.supabase.co`（必须以 `https://` 开头）
- ❌ 错误：`xxxxx.supabase.co`（缺少协议）、`http://xxxxx.supabase.co`（应该是 https）

---

## 步骤 2：检查 Render 日志

### 查看存储初始化消息：

1. 在 Render 后端服务页面，点击 **Logs** 标签
2. 滚动到应用启动时的日志（最新的部署日志）
3. **查找以下消息**：

### ✅ 应该看到的（成功）：
```
Storage backend 'supabase' initialized successfully
```

### ❌ 不应该看到的（失败）：
```
No storage backend configured. Upload functionality will be disabled.
```
或
```
Supabase credentials not provided
```
或
```
Supabase connection test failed: ...
```

---

## 步骤 3：检查 Supabase 配置

### 验证 Supabase Storage 配置：

1. **登录 Supabase Dashboard**：https://app.supabase.com
2. **检查存储桶是否存在**：
   - 进入 **Storage** → **Buckets**
   - 确认 `memoluck-files` 存储桶存在
   - **重要**：确保存储桶是 **Public**（公开的）
   
3. **检查 API 密钥**：
   - 进入 **Settings** → **API**
   - 确认使用的是 **anon public** key（不是 `service_role` key）
   - 复制完整的 key（应该以 `eyJ` 开头，非常长）

4. **检查 Project URL**：
   - 在 **Settings** → **API** 中
   - 确认 **Project URL** 格式为：`https://xxxxx.supabase.co`

---

## 步骤 4：测试 Supabase Storage 连接

### 方法 1：检查 Render 日志中的错误信息

如果存储初始化失败，日志中会显示具体错误。常见错误：

#### 错误 1：`Supabase credentials not provided`
**原因**：`SUPABASE_URL` 或 `SUPABASE_KEY` 未设置或为空

**解决**：
- 在 Render Environment 中检查这两个变量
- 确保值不为空
- 重新保存并部署

#### 错误 2：`Supabase connection test failed: ...`
**原因**：API 密钥无效或 URL 错误

**解决**：
- 重新从 Supabase Dashboard 复制 **Project URL** 和 **anon public key**
- 确保复制完整（包括 `https://` 和完整的 key 字符串）
- 更新 Render 环境变量
- 重新部署

#### 错误 3：`Supabase library not installed`
**原因**：`requirements.txt` 中缺少 `supabase` 库

**解决**：这不应该发生，因为 `requirements.txt` 中已包含 `supabase==2.4.0`。如果看到此错误，请联系技术支持。

---

## 步骤 5：强制重新部署

有时环境变量更改后需要手动触发重新部署：

1. 在 Render 后端服务页面
2. 点击 **Manual Deploy** → **Deploy latest commit**
3. 等待部署完成（2-5 分钟）
4. 检查日志确认存储初始化成功

---

## 📋 配置检查清单

使用以下清单确认配置正确：

- [ ] **Render 环境变量已添加**：
  - [ ] `STORAGE_TYPE=supabase`
  - [ ] `SUPABASE_URL=https://xxxxx.supabase.co`（完整 URL，https:// 开头）
  - [ ] `SUPABASE_KEY=eyJ...`（完整的 anon public key）
  - [ ] `SUPABASE_BUCKET=memoluck-files`

- [ ] **环境变量值正确**：
  - [ ] 没有拼写错误
  - [ ] 没有多余的空格
  - [ ] URL 格式正确（https:// 开头）

- [ ] **Supabase 配置正确**：
  - [ ] 存储桶 `memoluck-files` 已创建
  - [ ] 存储桶设置为 **Public**
  - [ ] 使用的是 **anon public key**（不是 service_role key）

- [ ] **部署已完成**：
  - [ ] 已保存环境变量更改
  - [ ] Render 已完成重新部署（2-5 分钟）
  - [ ] 日志显示 `Storage backend 'supabase' initialized successfully`

---

## 🔧 如果仍然失败

如果按照以上步骤检查后仍然失败，请：

1. **复制 Render 日志中的完整错误信息**（特别是包含 "Supabase" 或 "Storage" 的行）
2. **确认环境变量值**（可以临时截图，但注意不要泄露完整的 API key）
3. **检查 Supabase Dashboard** 中存储桶是否真的存在且为 Public

然后告诉我具体的错误信息，我会进一步帮助你排查。

---

## 💡 关于 Transaction Pooler

**Transaction Pooler 只影响数据库连接，不影响 Storage。**

Supabase Storage 使用 REST API，与 PostgreSQL 数据库完全独立：
- **数据库连接**：使用 `DATABASE_URL`，可能受 Transaction Pooler 影响
- **Storage API**：使用 `SUPABASE_URL` 和 `SUPABASE_KEY`，不受 Transaction Pooler 影响

如果你的 Storage 配置有问题，Transaction Pooler 不是原因。

