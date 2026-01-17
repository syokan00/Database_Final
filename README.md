# MemoLucky 🍀

**Lucky for you — あなたに届く、誰かの経験。**

> 大学生向けキャンパスライフ支援プラットフォーム

[![Live Demo](https://img.shields.io/badge/Demo-公開中-brightgreen)](https://syokan00.github.io/Database_Final/)
[![GitHub](https://img.shields.io/badge/GitHub-リポジトリ-blue)](https://github.com/syokan00/Database_Final)

---

## 📖 プロジェクト概要

**MemoLucky** は、大学生がキャンパスライフで必要な情報を共有し、助け合えるコミュニティを構築するフルスタック Web アプリケーションです。

**"Lucky for you — あなたに届く、誰かの経験。"**

---

## ✨ 主要機能

### 📝 経験談共有（Notes）
- 投稿作成・閲覧、タグ・カテゴリ・キーワードで検索
- いいね、お気に入り、コメント機能
- 画像・添付ファイル対応、匿名投稿

### 🛍️ キャンパスフリマ（Items）
- 中古品の出品・購入（教科書、家電など）
- カテゴリ・ステータス・価格でフィルタリング
- 出品アイテムの編集・削除

### 🧪 研究室情報（Labs）
- 各研究室の情報と体験談を閲覧

### 💼 就活情報（Jobs）
- 先輩の就活体験談・面接情報を閲覧

### 👤 ユーザー管理
- JWT 認証、プロフィール管理（アバター、カバー画像、自己紹介）
- フォロー・フォロワーシステム

### 🔔 通知システム
- いいね、コメント、フォロー、メッセージのリアルタイム通知
- 既読/未読管理、通知センター

### 💬 メッセージング・チャット
- ユーザー間の直接メッセージ、アイテム専用チャット

### 🏆 バッジシステム
- 活動に応じたバッジ獲得（初投稿、夜更かしの秀才、継続の達人など）

### 📱 PWA
- モバイルアプリとしてインストール可能、オフラインサポート

---

## 🛠️ 技術スタック

### フロントエンド
- **React** 19.2.0 + **Vite** 7.2.4
- **React Router** 7.9.6 (HashRouter)
- **Axios** 1.13.2
- **Context API** (状態管理)

### バックエンド
- **FastAPI** 0.104.1 + **Uvicorn** 0.24.0
- **PostgreSQL** + **SQLAlchemy** 2.0.23
- **Pydantic** 2.9.2 (データバリデーション)
- **JWT** + **Argon2** (認証・セキュリティ)
- **Bleach** 6.1.0 (HTML サニタイゼーション)

### ストレージ・キャッシュ
- **Supabase Storage** / **Cloudinary** / **MinIO** (オブジェクトストレージ)
- **Redis** 5.0.1 (キャッシュ・レート制限、オプション)

### インフラ
- **GitHub Pages** (フロントエンド)
- **Render** (バックエンド・データベース)
- **Docker** + **Docker Compose**
- **GitHub Actions** (CI/CD)

---

## 🌐 デプロイメント

### 本番環境
- **フロントエンド**: [GitHub Pages](https://syokan00.github.io/Database_Final/)
- **バックエンド**: Render.com
- **データベース**: Render PostgreSQL
- **ストレージ**: Supabase Storage / Cloudinary

詳細は [デプロイメントガイド](docs/Infra/deployment.md) を参照。

---

## 📁 プロジェクト構成

```
Database_Final/
├── frontend/              # React フロントエンド
│   ├── src/
│   │   ├── components/    # UI コンポーネント
│   │   ├── contexts/      # Context API
│   │   ├── pages/         # ページコンポーネント
│   │   └── api/           # API クライアント
│   └── public/            # 静的アセット
├── backend/               # FastAPI バックエンド
│   ├── app/
│   │   ├── main.py        # エントリーポイント
│   │   ├── models.py      # データベースモデル
│   │   ├── auth.py        # 認証
│   │   ├── posts.py       # 投稿 API
│   │   ├── items.py       # アイテム API
│   │   ├── uploads.py     # ファイルアップロード
│   │   └── storage.py     # ストレージ抽象化
│   └── requirements.txt
├── docs/                  # プロジェクトドキュメント
└── README.md
```

---

## 📡 API ドキュメント

バックエンド実行時：`http://localhost:8000/docs`  
本番環境：https://memolucky-backend.onrender.com/docs

### 主要エンドポイント
- **認証**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **投稿**: `/api/posts/`, `/api/posts/{id}/like`
- **アイテム**: `/api/items/`, `/api/items/{id}`
- **ファイル**: `/api/uploads/avatar`, `/api/uploads/post-image`
- **通知**: `/api/notifications/`, `/api/notifications/unread/count`

---

## 🔧 トラブルシューティング

### データベース接続エラー
- データベースは自動的に作成されます。失敗した場合は Render PostgreSQL で手動作成、または `postgres` データベースを使用

### ファイルアップロードエラー（503）
- `STORAGE_TYPE` 環境変数を確認
- Supabase Storage の場合、RLS ポリシーを設定

### Redis 接続エラー
- `REDIS_ENABLED=false` で無効化可能（オプション）

### GitHub Pages 404 エラー
- HashRouter を使用しているため、URL は `/#/profile` 形式（自動リダイレクト）

詳細は [データベース接続トラブルシューティング](docs/Infra/database-connection-troubleshooting.md) を参照。

---

## 📚 ドキュメント

### プロジェクト管理
- [アプリケーション概要](docs/PM/app-overview.md)
- [プロジェクト報告書](docs/PM/project-report.md)
- [デモ動画](docs/PM/demo-video.md)

### ビジネス分析
- [ペルソナ](docs/BA/persona.md)
- [モチベーショングラフ](docs/BA/motivation-graph.md)
- [ストーリーボード](docs/BA/storyboard.md)
- [UI モック](docs/BA/ui-mock.md)

### システムアーキテクチャ
- [システムアーキテクチャ](docs/Architect/system-architecture.md)
- [RPO/RTO 定義](docs/Architect/rpo-rto.md)
- [DR/バックアップ戦略](docs/Architect/dr-backup.md)
- [パフォーマンス指標](docs/Architect/performance.md)

### データベース
- [ER 図](docs/DBA/er-diagram.md)

### インフラ
- [デプロイメントガイド](docs/Infra/deployment.md)
- [ストレージ設定](docs/Infra/quick-storage-setup.md)

---

## 🔒 セキュリティ

- **Argon2** パスワードハッシュ
- **JWT** トークンベース認証
- **SQLAlchemy ORM** (SQL インジェクション対策)
- **Pydantic** データバリデーション
- **Bleach** HTML サニタイゼーション
- **CORS** 設定
- **Redis** レート制限（オプション）

---

## 👥 メンバー（luckyfouru）

- **2442043** - 杉浦芙美子
- **2442053** - 竹髙 結衣
- **2442097** - 林 子嫻
- **2442103** - 小栗 花音

---

## 🔗 リンク

- **公開アプリケーション**: https://syokan00.github.io/Database_Final/
- **GitHub リポジトリ**: https://github.com/syokan00/Database_Final
- **本番 API**: https://memolucky-backend.onrender.com/docs

---

## 📄 ライセンス

このプロジェクトは教育目的で作成されました。

---

**MemoLucky** - Lucky for you — あなたに届く、誰かの経験。🍀
