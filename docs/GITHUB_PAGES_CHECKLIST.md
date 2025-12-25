# GitHub Pages 部署检查清单

## 问题诊断

如果 GitHub Pages 网站无法访问，请按以下步骤检查：

## 1. 检查 GitHub Pages 设置

1. 访问 GitHub 仓库：https://github.com/syokan00/Database_Final
2. 点击 **Settings**（设置）
3. 在左侧菜单中找到 **Pages**
4. 检查以下设置：
   - **Source**: 应该设置为 **GitHub Actions**（不是 Branch）
   - 如果显示 "Your site is live at..." 说明配置正确
   - 如果显示其他选项，请改为 **GitHub Actions**

## 2. 检查 GitHub Actions 工作流

1. 在仓库页面点击 **Actions** 标签
2. 查看 **Deploy Frontend to GitHub Pages** 工作流
3. 检查最近的运行记录：
   - ✅ 绿色勾号 = 成功
   - ❌ 红色叉号 = 失败
   - 🟡 黄色圆点 = 进行中

### 如果工作流失败：

点击失败的工作流，查看错误信息：
- **Build 失败**：检查 Node.js 版本、依赖安装、构建错误
- **Deploy 失败**：检查权限设置、环境配置

## 3. 检查工作流文件

确保 `.github/workflows/deploy-pages.yml` 存在且正确。

**重要**：不要有多个部署工作流文件，这会导致冲突。

## 4. 检查仓库权限

1. 在 **Settings** → **Actions** → **General**
2. 检查 **Workflow permissions**：
   - 应该设置为 **Read and write permissions**
   - 勾选 **Allow GitHub Actions to create and approve pull requests**

## 5. 手动触发部署

如果自动部署没有运行：

1. 在 **Actions** 标签页
2. 选择 **Deploy Frontend to GitHub Pages** 工作流
3. 点击 **Run workflow** 按钮
4. 选择 **main** 分支
5. 点击 **Run workflow**

## 6. 检查网站 URL

正确的 URL 应该是：
- https://syokan00.github.io/Database_Final/

**注意**：URL 是区分大小写的，确保大小写正确。

## 7. 清除浏览器缓存

如果网站更新后看不到变化：
- 按 `Ctrl + Shift + R`（Windows）或 `Cmd + Shift + R`（Mac）强制刷新
- 或使用无痕模式访问

## 8. 检查构建输出

在 GitHub Actions 的构建日志中检查：
- `frontend/dist` 目录是否成功创建
- 是否有构建错误或警告

## 常见问题

### 问题 1：网站显示 404
**原因**：GitHub Pages 设置不正确或工作流未运行
**解决**：按照步骤 1 和 2 检查

### 问题 2：网站显示空白页面
**原因**：构建失败或路径配置错误
**解决**：检查 `vite.config.js` 中的 `base` 配置，应该是 `/Database_Final/`

### 问题 3：工作流一直失败
**原因**：权限不足或配置错误
**解决**：按照步骤 4 检查权限设置

### 问题 4：更改后网站没有更新
**原因**：工作流未触发或缓存问题
**解决**：手动触发工作流（步骤 5）并清除缓存（步骤 7）

## 联系支持

如果以上步骤都无法解决问题，请检查：
1. GitHub Actions 的使用限制（免费账户有使用限制）
2. 仓库是否为公开仓库（GitHub Pages 免费版需要公开仓库）
3. 查看 GitHub 状态页面：https://www.githubstatus.com/

