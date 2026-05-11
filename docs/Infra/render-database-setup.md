# Render PostgreSQL 数据库设置指南

## 问题

应用启动时出现错误：`database "memoluck" does not exist`

## 解决方案

### 方法 1：在 Render 中手动创建数据库（推荐）

Render PostgreSQL 可能不允许通过应用代码创建数据库。最简单的方法是在 Render 中手动创建。

#### 步骤：

1. **进入 Render PostgreSQL 服务**
   - 在 Render Dashboard 中找到你的 PostgreSQL 数据库服务
   - 点击进入详情页

2. **使用 Render 的数据库工具（如果有）**
   - 查找 "Connect" 或 "SQL Editor" 选项
   - 如果可用，直接运行：
     ```sql
     CREATE DATABASE memoluck;
     ```

3. **或使用外部工具连接**
   - 复制 Render PostgreSQL 的 **External Database URL**
   - 使用 DBeaver、pgAdmin 或其他 PostgreSQL 客户端连接
   - 运行：
     ```sql
     CREATE DATABASE memoluck;
     ```

### 方法 2：使用现有的数据库名称

如果 Render PostgreSQL 已经有一个默认数据库（通常是 `postgres`），可以直接使用它：

1. **检查 Internal Database URL**
   - 在 Render PostgreSQL 服务页面
   - 查看 "Connections" 部分的 Internal Database URL
   - 注意 URL 末尾的数据库名称

2. **更新环境变量**
   - 如果数据库名称不是 `memoluck`，有两种选择：
     - **选项 A**：使用现有的数据库名称
       - 直接使用 Internal Database URL（包含正确的数据库名）
       - 在 Web Service 的 `DATABASE_URL` 环境变量中更新
     - **选项 B**：创建 `memoluck` 数据库（见方法 1）

### 方法 3：使用代码自动创建（已实现，但可能受限）

代码已经实现了自动创建数据库的逻辑，但可能受到 Render 权限限制。

如果自动创建失败，请使用方法 1 或方法 2。

## 验证

部署后，检查日志应该看到：
- ✅ `Successfully connected to database 'memoluck'` 或
- ✅ `Database 'memoluck' created successfully` 或
- ✅ `Database tables initialized successfully`

## 当前状态

- ✅ 代码已添加自动数据库创建逻辑
- ✅ 代码已添加错误处理和回退机制
- ⏳ 需要在 Render 中创建 `memoluck` 数据库或使用现有数据库

