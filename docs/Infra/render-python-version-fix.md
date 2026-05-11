# 修复 Render Python 版本问题 - 最终方案

## 问题

Render 仍然使用 Python 3.13.4，导致 `pydantic-core` 编译失败。

## 解决方案

### 方法 1：在 Render 设置环境变量（最可靠）

1. **进入 Render Dashboard**
   - 访问：https://dashboard.render.com
   - 找到 `memolucky-backend` 服务

2. **添加环境变量**
   - Settings → Environment → Add Environment Variable
   - **Key**: `PYTHON_VERSION`
   - **Value**: `3.11.10`
   - 点击 "Add"

3. **修改 Build Command**
   - Settings → Build & Deploy
   - **Build Command** 改为：
     ```
     pip install --upgrade pip setuptools wheel && pip install --only-binary :all: -r requirements.txt || pip install -r requirements.txt
     ```
   - 这个命令会：
     1. 先尝试只安装预编译的包（避免 Rust 编译）
     2. 如果失败，再尝试正常安装

4. **保存并重新部署**
   - 点击 "Save Changes"
   - 点击 "Manual Deploy" → "Deploy latest commit"

### 方法 2：使用更新的 pydantic 版本

如果方法 1 不行，可以尝试使用更新的 pydantic 版本（可能有 Python 3.13 的预编译包）。

## 当前状态

- ✅ `.python-version` 文件已创建（`backend/.python-version`）
- ✅ pydantic 已升级到 2.9.2（有预编译 wheel）
- ⏳ 需要在 Render 中设置 `PYTHON_VERSION` 环境变量
- ⏳ 需要修改 Build Command

## 检查清单

- [ ] 在 Render 添加了 `PYTHON_VERSION=3.11.10` 环境变量
- [ ] 修改了 Build Command
- [ ] 手动触发了重新部署
- [ ] 日志显示使用 Python 3.11.10
- [ ] 构建成功

