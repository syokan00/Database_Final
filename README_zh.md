# MemoLucky — 大学生校园社区平台

<div align="center">

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

**将经验分享、二手市场、消息通知、成就徽章集于一体的大学生专属社区**

[🌐 在线演示](https://syokan00.github.io/Database_Final/) · [📖 项目文档](#文档)

</div>

---

## 项目背景

大学生在学习、求职、校园生活中积累了大量经验，却缺乏一个专属的分享平台。  
MemoLucky 将「经验帖」「校内二手市场」「即时通讯」整合在一个轻量 Web App 中，  
让同学们无需切换多个平台即可完成知识共享与物品流转。

---

## 核心功能

| 功能 | 说明 |
|---|---|
| 📝 经验分享 | 发帖、标签、匿名、图片附件、多语言内容 |
| 🛍️ 二手市场 | 商品发布、购买申请、卖家私信 |
| 🔔 通知系统 | 点赞、评论、关注、消息的实时通知 |
| 🏆 徽章系统 | 首发帖、夜猫子、连续发帖等 8 种成就 |
| 💬 私信聊天 | 与商品卖家的直接消息对话 |
| 🌍 多语言 | 日语 / 英语界面切换 |
| 🔒 安全 | JWT 认证 + Argon2 密码哈希 + Redis 限流 |

---

## 技术架构

```
前端 (React 19 + Vite) ──REST API──► 后端 (FastAPI)
                                         │
                              ┌──────────┼──────────┐
                           PostgreSQL  Redis     MinIO
                              │
                           Celery（异步徽章任务）
```

**技术栈一览**

| 层级 | 技术 |
|---|---|
| 前端 | React 19.2, Vite 7.2, React Router v7, Axios, Lucide |
| 后端 | FastAPI 0.104, SQLAlchemy 2.0, Pydantic v2 |
| 数据库 | PostgreSQL 15 |
| 缓存/限流 | Redis 7 |
| 对象存储 | MinIO（S3 兼容） |
| 异步任务 | Celery 5.3 |
| 认证 | JWT (python-jose) + Argon2 |
| 基础设施 | Docker Compose, GitHub Actions, GitHub Pages |

---

## 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/syokan00/Database_Final.git
cd Database_Final

# 2. 配置环境变量
cp backend/env.example backend/.env
# 编辑 .env，填写 SECRET_KEY 等

# 3. 使用 Docker 一键启动
docker compose up -d

# 4. 启动前端开发服务器
cd frontend && npm install && npm run dev
```

访问 `http://localhost:5173` 即可使用。

---

## 项目亮点（面试用）

1. **完整的团队分工文档体系** — BA（用户分析）、Architect（系统设计）、DBA（数据库设计）、Infra（部署方案）、PM（项目管理）五个角色的完整文档
2. **生产级安全设计** — Argon2 密码哈希、JWT 过期管理、Redis API 限流、bleach XSS 过滤
3. **非同期徽章系统** — Celery + Redis 实现发帖后异步检测成就，不阻塞主线程
4. **MinIO 对象存储** — 自托管 S3 兼容存储，图片和附件统一管理

---

## 文档 <a id="文档"></a>

| 类别 | 内容 |
|---|---|
| [BA 业务分析](docs/BA/) | 用户画像、动机分析、故事板 |
| [系统架构](docs/Architect/) | 系统构成、灾备方案、RPO/RTO |
| [数据库设计](docs/DBA/) | ER 图、索引策略、分区方案 |
| [基础设施](docs/Infra/) | Docker 配置、CI/CD 流程 |
| [项目管理](docs/PM/) | WBS、里程碑、风险管理 |

---

## License

MIT
