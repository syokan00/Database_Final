# MemoLucky 🍀

**Lucky for you — あなたに届く、誰かの経験。**

> A full-stack campus life support platform for university students

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://syokan00.github.io/Database_Final/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/syokan00/Database_Final)

## 📖 Project Overview

**MemoLucky** is a comprehensive web application designed to help university students share experiences, trade items, and exchange valuable information about campus life. The platform enables students to connect with seniors, learn from real experiences, and build a supportive community.

### Vision
**"Lucky for you — あなたに届く、誰かの経験。"** (Your luck arrives through someone else's experience.)

We believe that the best knowledge comes from real experiences shared by those who have walked the same path. MemoLucky bridges the gap between students at different stages of their university journey.

---

## ✨ Key Features

### 📝 Experience Sharing (Notes)
- Share and browse authentic experiences from seniors
- Search and filter by tags, categories, and keywords
- Like and favorite posts
- Comment and engage in discussions
- Rich media support (images, attachments)

### 🛍️ Campus Marketplace (Items)
- Buy and sell second-hand items (textbooks, appliances, etc.)
- Item categories: textbooks, appliances, and more
- Advanced filtering by category, status, and price
- Edit and manage your own listings
- Real-time item status updates

### 🧪 Research Lab Information (Labs)
- Browse information about different research laboratories
- Read experiences and reviews from lab members
- Find the perfect lab for your interests

### 💼 Job Hunting Resources (Jobs)
- Access job hunting experiences and insights
- Learn from senior students' interview experiences
- Company and position information sharing

### 👤 User Management
- Secure registration and login (JWT authentication)
- Comprehensive profile management (avatar, cover image, bio)
- User profile browsing and following system
- Followers/following lists

### 🔔 Notification System
- Real-time notifications for likes, comments, follows, and messages
- Read/unread status management (individual and bulk)
- Smart navigation to related content
- Notification center with filtering

### 💬 Messaging & Chat
- Direct messaging between users
- Item-specific chat for marketplace transactions
- Real-time message delivery

### 🏆 Achievement Badge System
- Earn badges based on activity and achievements
- Badges include: First Post, Night Owl, Streak Poster, Polyglot, Heart Collector, Comment King, Top Seller, and more
- Display badges on your profile

### 🌐 Internationalization
- Multi-language support (Japanese, Chinese, English)
- Language switching interface

### 📱 Progressive Web App (PWA)
- Install as a mobile app
- Offline support with service worker
- Responsive design for all devices

---

## 🛠️ Technology Stack

### Frontend
- **React** 19.2.0 - Modern UI library
- **Vite** 7.2.4 - Lightning-fast build tool
- **React Router** 7.9.6 - Client-side routing (HashRouter for GitHub Pages compatibility)
- **Axios** 1.13.2 - HTTP client
- **Context API** - State management (Auth, Language, Posts)
- **PWA** - Service Worker for offline support

### Backend
- **FastAPI** 0.104.1 - High-performance Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** 2.0.23 - Modern Python ORM
- **Pydantic** 2.9.2 - Data validation
- **JWT** - Secure token-based authentication
- **Argon2** - Password hashing algorithm

### Storage & Caching
- **Supabase Storage** - Object storage for files and images (via HTTP API)
- **Cloudinary** - Alternative image storage (25GB free tier)
- **MinIO** - Self-hosted object storage option
- **Redis** 5.0.1 - Caching and rate limiting (optional)

### Infrastructure & DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Pages** - Frontend static hosting
- **Render** - Backend and database hosting
- **GitHub Actions** - CI/CD automation

---

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Node.js** 18+ installed
- **Git** installed

### 1. Clone Repository
```bash
git clone https://github.com/syokan00/Database_Final.git
cd Database_Final
```

### 2. Backend Setup

#### Environment Variables
Create a `.env` file in the project root:

```bash
# Copy example file
cp .env.example .env  # Linux/Mac
# or
Copy-Item .env.example .env  # Windows
```

#### Database Options

**Option A: Use Shared Demo Database (Read-only)**
```env
DATABASE_URL=postgresql://readonly_demo:demo_readonly_2025@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```
⚠️ **Note**: This is read-only. You can browse posts but cannot register or create content.

**Option B: Use Local Database (Full functionality)**
```env
DATABASE_URL=postgresql://postgres:changeme@db:5432/memoluck
```

#### Storage Configuration (Required for Uploads)
```env
STORAGE_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_BUCKET=memoluck-files
```

See [Storage Configuration Guide](docs/Infra/quick-storage-setup.md) for detailed setup.

#### Start Backend Services
```bash
docker-compose up -d
```
Backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend development server: `http://localhost:5173`

---

## 🌐 Deployment

### Production Environment

- **Frontend**: [GitHub Pages](https://syokan00.github.io/Database_Final/)
- **Backend API**: Render.com
- **Database**: Render PostgreSQL
- **Storage**: Supabase Storage / Cloudinary

### Deployment Documentation
Detailed deployment guides are available in [docs/Infra/](docs/Infra/):
- [Complete Deployment Guide](docs/Infra/deployment.md)
- [Storage Setup Guide](docs/Infra/quick-storage-setup.md)
- [Troubleshooting Guide](docs/Infra/storage-troubleshooting.md)

---

## 📁 Project Structure

```
Database_Final/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React Context providers
│   │   ├── pages/          # Page components
│   │   ├── api/            # API client utilities
│   │   ├── i18n/           # Internationalization
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── package.json
│
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── main.py         # Application entry point
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── auth.py         # Authentication endpoints
│   │   ├── posts.py        # Post management
│   │   ├── items.py        # Marketplace items
│   │   ├── uploads.py      # File upload handling
│   │   ├── storage.py      # Storage abstraction layer
│   │   └── ...            # Other API modules
│   ├── requirements.txt
│   └── Dockerfile
│
├── docs/                    # Project documentation
│   ├── BA/                 # Business Analysis
│   ├── Architect/          # System Architecture
│   ├── DBA/                # Database Administration
│   ├── Infra/              # Infrastructure & Deployment
│   └── PM/                 # Project Management
│
├── docker-compose.yml       # Docker Compose configuration
└── README.md               # This file
```

---

## 📚 Documentation

### Project Management
- [Application Overview](docs/PM/app-overview.md)
- [Project Report](docs/PM/project-report.md)
- [Demo Video](docs/PM/demo-video.md)

### Business Analysis
- [Personas](docs/BA/persona.md)
- [Motivation Graph](docs/BA/motivation-graph.md)
- [Storyboard](docs/BA/storyboard.md)
- [UI Mockups](docs/BA/ui-mock.md)

### System Architecture
- [System Architecture](docs/Architect/system-architecture.md)
- [RPO/RTO Definitions](docs/Architect/rpo-rto.md)
- [DR/Backup Strategy](docs/Architect/dr-backup.md)
- [Performance Metrics](docs/Architect/performance.md)

### Database
- [ER Diagram](docs/DBA/er-diagram.md)

### Infrastructure
- [Deployment Guide](docs/Infra/deployment.md)
- [Storage Configuration](docs/Infra/quick-storage-setup.md)
- [Troubleshooting](docs/Infra/storage-troubleshooting.md)

---

## 🔒 Security Features

- **Password Security**: Argon2 hashing algorithm
- **Authentication**: JWT token-based authentication
- **CORS Protection**: Configurable cross-origin request restrictions
- **Rate Limiting**: Redis-based rate limiting (optional)
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
- **Input Validation**: Pydantic schema validation
- **Content Sanitization**: Bleach for HTML sanitization

---

## 👥 Team Members (luckyfouru)

- **2442043** - 杉浦芙美子 (Sugiura Fumiko)
- **2442053** - 竹髙 結衣 (Takehaka Yui)
- **2442097** - 林 子嫻 (Lin Zixian)
- **2442103** - 小栗 花音 (Oguri Kano)

---

## 🤝 Contributing

This project was created for educational purposes. For questions or suggestions, please open an issue on GitHub.

---

## 🔗 Links

- **Live Application**: https://syokan00.github.io/Database_Final/
- **GitHub Repository**: https://github.com/syokan00/Database_Final
- **API Documentation**: Available at `/docs` endpoint when backend is running

---

## 📄 License

This project is created for educational purposes.

---

**MemoLucky** - Lucky for you — あなたに届く、誰かの経験。🍀
