# 数据库共享配置指南

## 问题说明
当前每台电脑使用独立的本地数据库，数据无法同步。为了解决这个问题，我们需要将所有电脑连接到同一个云数据库。

## 推荐方案：使用 Supabase（免费）

### 步骤1：创建 Supabase 账户和数据库

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 账户登录（或创建新账户）
4. 创建新项目：
   - Organization: 选择或创建组织
   - Name: `memoluck` (或您喜欢的名称)
   - Database Password: 设置一个强密码（**请记住这个密码！**）
   - Region: 选择最近的区域（如 `Northeast Asia (Tokyo)`)
5. 等待项目创建完成（约2分钟）

### 步骤2：获取数据库连接信息

1. 在 Supabase 项目页面，点击左侧菜单的 "Settings" → "Database"
2. 找到 "Connection string" 部分
3. 选择 "URI" 标签
4. 复制连接字符串，格式类似：
   ```
   postgresql://postgres.[项目ID]:[您的密码]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```

**重要：** 连接字符串中有两种模式：
- **Transaction mode (推荐用于应用):** 端口 `6543`
- **Session mode:** 端口 `5432`

我们使用 Transaction mode (端口 6543)。

### 步骤3：配置 docker-compose.yml

在您的 `docker-compose.yml` 中，找到 `backend` 服务，修改 `DATABASE_URL`：

```yaml
backend:
  environment:
    # 替换为您的 Supabase 连接字符串
    - DATABASE_URL=postgresql://postgres.[项目ID]:[您的密码]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**或者使用环境变量文件（推荐）：**

1. 创建 `.env` 文件（在项目根目录）：
```env
# Supabase 数据库配置
DATABASE_URL=postgresql://postgres.[项目ID]:[您的密码]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

# 其他配置保持不变
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme
POSTGRES_DB=memoluck
```

2. 修改 `docker-compose.yml`：
```yaml
backend:
  environment:
    - DATABASE_URL=${DATABASE_URL}
```

### 步骤4：禁用本地数据库（可选）

如果使用云数据库，可以注释掉本地数据库服务，节省资源：

```yaml
# 注释掉或删除本地数据库
# db:
#   image: postgres:15
#   ...
```

但保留也可以，不会影响使用。

### 步骤5：运行数据库迁移

连接到云数据库后，需要运行迁移脚本创建表结构：

**选项A：使用自动迁移（推荐）**
后端启动时会自动运行迁移（已在 `main.py` 中配置）。

**选项B：手动运行 init.sql**
```bash
# 从 Supabase Dashboard 的 SQL Editor 运行 db/init.sql 的内容
```

### 步骤6：重启服务

```bash
docker-compose down
docker-compose up -d --build
```

### 步骤7：验证连接

检查后端日志，确认连接成功：
```bash
docker-compose logs backend | grep -i "migration\|database"
```

应该看到：`Database migration completed successfully`

## 在所有电脑上配置

1. 将 `.env` 文件复制到所有需要同步的电脑
2. 或者将 `DATABASE_URL` 直接写入每台电脑的 `docker-compose.yml`
3. 在所有电脑上运行 `docker-compose up -d --build`

## 注意事项

1. **安全性：** `.env` 文件包含密码，**不要**提交到 Git
   - 确认 `.gitignore` 包含 `.env`
   
2. **数据库密码：** 如果忘记 Supabase 密码，可以在 Settings → Database 中重置

3. **免费额度：** Supabase 免费版限制：
   - 500MB 数据库空间
   - 2GB 带宽/月
   - 足够用于演示和小型项目

4. **备份：** Supabase 自动备份，但建议定期导出数据：
   ```bash
   # 从 Supabase 导出
   pg_dump "连接字符串" > backup.sql
   ```

## 故障排除

### 连接失败
- 检查密码是否正确
- 检查网络连接
- 确认使用的是 Transaction mode (端口 6543)

### 表不存在错误
- 运行 `db/init.sql` 在 Supabase SQL Editor 中
- 或者让后端自动迁移（重启后端）

### 权限错误
- 确认使用的是正确的数据库用户（通常是 `postgres`）

## 替代方案

如果不想使用 Supabase，也可以考虑：
- **Render.com** (免费 PostgreSQL)
- **Neon.tech** (免费 PostgreSQL)
- **Railway.app** (免费额度)

配置方法类似，都是获取连接字符串后配置 `DATABASE_URL`。

