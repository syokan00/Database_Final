# Render 数据库问题 - 最简单解决方案

## 问题

应用启动时出现：`database "memoluck" does not exist`

## 最简单解决方案：使用 Render PostgreSQL 的默认数据库

不需要手动创建数据库！直接使用 Render PostgreSQL 提供的默认数据库即可。

### 步骤：

1. **进入 Render Dashboard**
   - 访问：https://dashboard.render.com
   - 找到你的 **PostgreSQL 数据库服务**

2. **复制 Internal Database URL**
   - 在数据库服务页面，找到 "Connections" 部分
   - 复制 **Internal Database URL**
   - 这个 URL 通常以 `postgres://` 开头
   - URL 末尾的数据库名称通常是 `postgres` 或其他默认名称

3. **更新 Web Service 的环境变量**
   - 进入 `memolucky-backend` Web Service
   - 点击 "Settings" → "Environment"
   - 找到 `DATABASE_URL` 环境变量
   - 点击编辑，将值替换为刚才复制的 **Internal Database URL**
   - **重要**：确保使用完整的 URL，不要修改数据库名称部分
   - 点击 "Save Changes"

4. **重新部署**
   - 返回服务页面
   - 点击 "Manual Deploy" → "Deploy latest commit"
   - 等待部署完成

## 示例

如果你的 Internal Database URL 是：
```
postgres://user:password@dpg-xxxxx-a.singapore-postgres.render.com:5432/postgres
```

那么：
- ✅ 直接使用这个 URL（数据库名称是 `postgres`）
- ❌ 不要改成 `memoluck`

代码会自动使用这个数据库，并在其中创建所有需要的表。

## 验证

部署后，检查日志应该看到：
- ✅ `Successfully connected to database 'postgres'`（或你使用的数据库名称）
- ✅ `Database tables initialized successfully`
- ✅ 服务状态变为 "Live"

## 为什么这样做？

- Render PostgreSQL 创建时已经有一个默认数据库
- 不需要手动创建新数据库
- 应用会在现有数据库中创建所有需要的表
- 这是最简单、最可靠的方法

## 如果还有问题

如果 Internal Database URL 中的数据库名称不是 `postgres`，也没关系：
- 直接使用 Render 提供的 URL
- 代码会自动使用这个数据库
- 所有表都会在这个数据库中创建

