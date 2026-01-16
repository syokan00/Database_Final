# 隐私检查与前端重新部署指南

## 步骤 1：隐私安全检查

### 1.1 检查敏感文件是否被提交

运行以下命令检查是否有敏感文件被提交到 Git：

```bash
# 检查是否有 .env 文件被提交
git ls-files | findstr /i "\.env$"

# 应该只看到 .env.example，不应该看到 .env
```

### 1.2 检查 .gitignore 配置

确认 `.gitignore` 文件包含以下内容：

```
.env
.env.local
.env.*.local
backend/.env
backend/.venv/
```

### 1.3 如果发现敏感文件被提交

如果发现 `.env` 或其他敏感文件被提交，需要：

1. **从 Git 历史中删除**（如果已经推送）：
   ```bash
   git rm --cached .env
   git rm --cached backend/.env
   git commit -m "Remove sensitive .env files from repository"
   ```

2. **检查 Git 历史**：
   ```bash
   git log --all --full-history -- .env
   ```

3. **如果已经推送到 GitHub**：
   - 立即在 GitHub 上删除敏感信息
   - 考虑重置相关密钥/密码
   - 使用 `git filter-branch` 或 `git filter-repo` 从历史中完全删除

### 1.4 当前状态检查

✅ **已确认安全**：
- `.env` 文件在 `.gitignore` 中
- 只有 `backend/env.example` 被提交（这是模板文件，安全）
- 没有实际的 `.env` 文件被提交

## 步骤 2：前端重新部署

### 2.1 方法 1：通过代码推送自动触发（推荐）

1. **确保所有更改已提交**：
   ```bash
   git status
   git add .
   git commit -m "Update frontend configuration"
   ```

2. **推送到 main 分支**：
   ```bash
   git push origin main
   ```

3. **GitHub Actions 会自动触发**：
   - 进入 GitHub 仓库页面
   - 点击 "Actions" 标签
   - 查看 "Deploy Frontend to GitHub Pages" workflow
   - 等待部署完成（通常 2-5 分钟）

### 2.2 方法 2：手动触发 GitHub Actions

1. **进入 GitHub 仓库**：
   - 访问：https://github.com/syokan00/Database_Final

2. **手动触发部署**：
   - 点击 "Actions" 标签
   - 在左侧选择 "Deploy Frontend to GitHub Pages"
   - 点击 "Run workflow" 按钮
   - 选择 "main" 分支
   - 点击绿色的 "Run workflow" 按钮

3. **等待部署完成**：
   - 点击运行中的 workflow
   - 查看构建和部署进度
   - 等待状态变为绿色 ✓

### 2.3 方法 3：通过空提交触发

如果只是想触发重新部署而不改变代码：

```bash
git commit --allow-empty -m "Trigger frontend redeploy"
git push origin main
```

## 步骤 3：验证部署

### 3.1 检查部署状态

1. **GitHub Actions**：
   - 进入仓库的 "Actions" 页面
   - 查看最新的 workflow 运行状态
   - 应该显示绿色 ✓ 表示成功

2. **GitHub Pages**：
   - 进入仓库的 "Settings" → "Pages"
   - 查看部署状态和 URL
   - 应该显示：`https://syokan00.github.io/Database_Final/`

### 3.2 测试前端应用

1. **访问前端 URL**：
   - https://syokan00.github.io/Database_Final/

2. **检查功能**：
   - 页面是否正常加载
   - API 连接是否正常（检查浏览器控制台）
   - 功能是否正常工作

### 3.3 检查 API 连接

前端需要连接到后端 API。确保：

1. **GitHub Variables 配置**：
   - 进入仓库 "Settings" → "Secrets and variables" → "Actions" → "Variables"
   - 检查 `VITE_API_URL` 变量
   - 应该设置为 Render 后端 URL，例如：`https://memolucky-backend.onrender.com/api`

2. **如果未设置**：
   - 前端会使用默认值：`http://localhost:8001/api`
   - 这在生产环境中不会工作
   - 需要设置正确的 Render 后端 URL

## 步骤 4：设置 VITE_API_URL（如果未设置）

### 4.1 获取后端 URL

1. **从 Render Dashboard**：
   - 进入 `memolucky-backend` 服务
   - 复制服务 URL（例如：`https://memolucky-backend.onrender.com`）
   - 添加 `/api` 后缀：`https://memolucky-backend.onrender.com/api`

### 4.2 在 GitHub 中设置

1. **进入仓库设置**：
   - GitHub 仓库 → "Settings" → "Secrets and variables" → "Actions"

2. **添加变量**：
   - 点击 "Variables" 标签
   - 点击 "New repository variable"
   - **Name**: `VITE_API_URL`
   - **Value**: `https://memolucky-backend.onrender.com/api`（使用你的实际后端 URL）
   - 点击 "Add variable"

3. **触发重新部署**：
   - 使用步骤 2.2 的方法手动触发部署
   - 或推送一个空提交

## 快速检查清单

- [ ] `.env` 文件在 `.gitignore` 中
- [ ] 没有实际的 `.env` 文件被提交到 Git
- [ ] GitHub Actions workflow 配置正确
- [ ] `VITE_API_URL` 变量已设置（如果使用 Render 后端）
- [ ] 前端已成功部署到 GitHub Pages
- [ ] 前端可以正常访问后端 API

## 常见问题

### Q: 前端部署失败怎么办？

A: 检查：
1. GitHub Actions 日志中的错误信息
2. `VITE_API_URL` 变量是否正确设置
3. 前端代码是否有语法错误

### Q: 前端无法连接后端？

A: 检查：
1. 后端服务是否正常运行（Render Dashboard）
2. `VITE_API_URL` 是否正确设置
3. 浏览器控制台是否有 CORS 错误
4. 后端 CORS 配置是否允许 GitHub Pages 域名

### Q: 如何更新前端配置？

A: 
1. 修改前端代码
2. 提交并推送到 main 分支
3. GitHub Actions 会自动重新部署

