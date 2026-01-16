# 快速配置云数据库指南

## 为什么需要云数据库？

当前每台电脑使用独立的本地数据库，**数据无法同步**。配置云数据库后，所有电脑可以共享同一份数据。

## 推荐方案：Supabase（免费，5分钟配置）

### 步骤1：创建 Supabase 账户（2分钟）

1. 访问 https://supabase.com
2. 点击 **"Start your project"**
3. 使用 **GitHub 账户登录**（最简单）
4. 点击 **"New Project"**：
   - **Name**: `memoluck` 
   - **Database Password**: 设置一个强密码（**务必记住！**）
   - **Region**: `Northeast Asia (Tokyo)` 或离您最近的区域
5. 等待创建完成（约2分钟）

### 步骤2：获取数据库连接字符串（1分钟）

1. 在项目页面，点击左侧 **Settings** → **Database**
2. 滚动到 **"Connection string"** 部分
3. 选择 **"URI"** 标签
4. 选择 **"Transaction mode"**（端口 6543，推荐用于应用）
5. 复制连接字符串，格式类似：
   ```
   postgresql://postgres.xxxxxxxxxxxxx:您的密码@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```

### 步骤3：配置项目（2分钟）

#### 方法A：使用 .env 文件（推荐）

1. 在项目根目录创建 `.env` 文件：
   ```bash
   # 复制模板文件
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，取消注释并填入您的 Supabase 连接字符串：
   ```env
   DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:您的密码@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```

#### 方法B：直接在 docker-compose.yml 中配置（不推荐，但也可以）

修改 `docker-compose.yml` 中 `backend` 和 `celery` 服务的 `DATABASE_URL` 行。

### 步骤4：初始化数据库表结构

#### 选项1：自动迁移（最简单）

后端启动时会自动创建表和添加缺失字段。只需重启：

```bash
docker-compose down
docker-compose up -d --build
```

#### 选项2：手动运行 SQL

1. 在 Supabase Dashboard，点击左侧 **SQL Editor**
2. 点击 **"New query"**
3. 复制 `db/init.sql` 文件的内容
4. 粘贴到编辑器并点击 **"Run"**

### 步骤5：验证配置

```bash
# 查看后端日志
docker-compose logs backend | grep -i "migration"

# 应该看到：
# Database migration completed successfully
```

### 步骤6：测试

1. 在一台电脑上注册一个用户并发布帖子
2. 在另一台电脑上刷新页面，应该能看到新帖子

## 在其他电脑上配置

### 方法1：共享 .env 文件

将 `.env` 文件复制到其他电脑的项目目录（**不要提交到 Git！**）

### 方法2：手动配置

在其他电脑上重复步骤3，使用相同的 Supabase 连接字符串。

## 安全注意事项

1. **不要将 `.env` 文件提交到 Git**
   - 已在 `.gitignore` 中配置
   - `.env` 包含数据库密码，必须保密

2. **保护 Supabase 密码**
   - 不要分享给不信任的人
   - 如果泄露，立即在 Supabase 中重置密码

## 故障排除

### 连接失败：`could not connect to server`

- 检查连接字符串是否正确
- 确认使用的是 **Transaction mode** (端口 6543)
- 检查网络连接

### 表不存在错误

- 运行 `db/init.sql` 在 Supabase SQL Editor
- 或重启后端让自动迁移运行

### 仍然看不到其他电脑的帖子

- 确认所有电脑使用相同的 `DATABASE_URL`
- 检查后端日志确认连接成功
- 在 Supabase Dashboard → Table Editor 查看是否有数据

## Supabase 免费额度

- ✅ 500MB 数据库空间
- ✅ 2GB 带宽/月  
- ✅ 自动备份
- ✅ 完全免费（足够演示和小型项目）

## 完成！

配置完成后，所有电脑都会连接到同一个云数据库，数据会自动同步。🎉

有任何问题请查看 `DATABASE_SETUP.md` 获取详细说明。

