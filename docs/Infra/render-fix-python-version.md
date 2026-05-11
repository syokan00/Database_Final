# 修复 Render Python 版本问题

## 问题

Render 正在使用 Python 3.13.4，但项目需要 Python 3.11。这导致 `pydantic-core` 编译失败。

## 解决方案

### 方法 1：在 Render Dashboard 手动触发重新部署（推荐）

1. **进入 Render Dashboard**
   - 访问：https://dashboard.render.com
   - 找到 `memolucky-backend` 服务

2. **手动触发部署**
   - 点击服务名称进入详情页
   - 点击右上角的 **"Manual Deploy"** 按钮
   - 选择 **"Deploy latest commit"**
   - 点击 **"Deploy"**

3. **验证部署**
   - 查看 Logs，应该看到：
     ```
     Installing Python version 3.11.10
     ```
   - 而不是 `3.13.4`

### 方法 2：在 Render 设置中指定 Python 版本

如果方法 1 不起作用：

1. **进入服务设置**
   - Render Dashboard → `memolucky-backend` → Settings

2. **查找 Python 版本设置**
   - 在 "Build & Deploy" 部分
   - 查找 "Python Version" 或类似选项
   - 手动选择 `3.11.10` 或 `3.11`

3. **保存并重新部署**

### 方法 3：修改 Build Command（临时方案）

如果上述方法都不行，可以修改 Build Command：

```
pip install --upgrade pip setuptools wheel && pip install --only-binary :all: -r requirements.txt || pip install -r requirements.txt
```

这个命令会：
1. 先尝试只安装预编译的包（--only-binary）
2. 如果失败，再尝试编译安装

## 验证修复

部署成功后，检查日志应该看到：
- ✅ `Installing Python version 3.11.10`
- ✅ 所有包安装成功
- ✅ 服务状态变为 "Live"

## 当前状态

- ✅ `runtime.txt` 已创建并推送到 GitHub
- ✅ `requirements.txt` 已更新
- ⏳ 等待 Render 检测到新 commit 或手动触发部署

