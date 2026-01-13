# 数据库迁移指南

如果您从旧版本升级到新版本，需要为现有数据库添加新的字段。

## 自动迁移（推荐）

如果您是从零开始，只需要重新创建数据库：

```bash
# 停止容器并删除数据卷
docker-compose down -v

# 重新启动（会自动运行 init.sql 创建新表结构）
docker-compose up -d
```

**注意**: 这会删除所有现有数据！

## 手动迁移（保留数据）

如果您已有数据需要保留，请运行以下 SQL 命令：

### 1. 连接到数据库

```bash
docker-compose exec db psql -U postgres -d memoluck
```

### 2. 执行迁移 SQL

```sql
-- 添加 users 表缺失的字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS grade VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 添加 posts 表缺失的字段
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- 添加 items 表缺失的字段
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;
```

### 3. 验证迁移

```sql
-- 检查 users 表结构
\d users

-- 检查 posts 表结构
\d posts

-- 检查 items 表结构
\d items
```

### 4. 退出并重启后端

```bash
# 退出 psql
\q

# 重启后端服务
docker-compose restart backend
```

## 迁移脚本

您也可以将上面的 SQL 保存为文件并执行：

```bash
# 创建迁移文件
cat > migration.sql << 'EOF'
ALTER TABLE users ADD COLUMN IF NOT EXISTS grade VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;
EOF

# 执行迁移
docker-compose exec -T db psql -U postgres -d memoluck < migration.sql

# 删除迁移文件
rm migration.sql
```

## 新版本的新字段说明

### users 表
- `grade`: 学年（如：大一、大二、M1、M2 等）
- `bio`: 个人简介
- `cover_image_url`: 个人主页背景图 URL

### posts 表
- `image_urls`: 图片 URL（逗号分隔）
- `attachments`: 文件附件（JSON 格式）
- `is_anonymous`: 是否匿名投稿

### items 表
- `is_anonymous`: 是否匿名商品（当前版本商品不支持匿名，但字段保留）

## 故障排除

如果遇到字段已存在的错误，这是正常的（`IF NOT EXISTS` 会跳过已存在的字段）。

如果遇到其他错误，请检查：
1. 数据库容器是否正在运行：`docker-compose ps`
2. 数据库名称是否正确（默认：`memoluck`）
3. 是否有足够的权限执行 ALTER TABLE

