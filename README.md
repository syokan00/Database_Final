# MemoLucky 🍀

**Lucky for you — あなたに届く、誰かの経験。**

> 大学生向けキャンパスライフ支援プラットフォーム

[![Live Demo](https://img.shields.io/badge/Demo-公開中-brightgreen)](https://syokan00.github.io/Database_Final/)
[![GitHub](https://img.shields.io/badge/GitHub-リポジトリ-blue)](https://github.com/syokan00/Database_Final)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB)](https://react.dev/)

---

## 📖 目次

- [プロジェクト概要](#-プロジェクト概要)
- [主要機能](#-主要機能)
- [技術スタック](#-技術スタック)
- [クイックスタート](#-クイックスタート)
- [デプロイメント](#-デプロイメント)
- [プロジェクト構成](#-プロジェクト構成)
- [API ドキュメント](#-api-ドキュメント)
- [トラブルシューティング](#-トラブルシューティング)
- [コントリビューション](#-コントリビューション)
- [ドキュメント](#-ドキュメント)
- [ライセンス](#-ライセンス)

---

## 📖 プロジェクト概要

**MemoLucky** は、大学生がキャンパスライフで必要な情報を共有し、助け合えるコミュニティを構築することを目的としたフルスタック Web アプリケーションです。先輩たちのリアルな経験談、フリマ、研究室情報、就活情報などを一元的に管理・閲覧できます。

### ビジョン
**"Lucky for you — あなたに届く、誰かの経験。"**

私たちは、同じ道を歩んできた人々が共有する実体験から、最も価値のある知識が生まれると信じています。MemoLucky は、大学の異なる段階にいる学生たちの間のギャップを埋める架け橋となります。

### 主な特徴

- 🎓 **大学生向け**：新入生から卒業生まで、すべての学生が利用可能
- 🔐 **安全な認証**：JWT トークンベースの認証システム
- 📱 **PWA対応**：モバイルアプリとしてインストール可能
- 🌐 **レスポンシブデザイン**：デスクトップ、タブレット、スマートフォンに対応
- ⚡ **高速パフォーマンス**：React + Vite による最適化されたフロントエンド
- 🔄 **リアルタイム更新**：通知システムによるリアルタイムな情報共有

---

## ✨ 主要機能

### 📝 経験談共有（Notes）

- **投稿作成・閲覧**：先輩の実体験を投稿・閲覧
- **検索・フィルタリング**：タグ、カテゴリ、キーワードで検索
- **ソーシャル機能**：
  - いいね機能
  - お気に入り機能
  - コメント機能とディスカッション
- **リッチメディア対応**：
  - 画像アップロード（複数画像対応）
  - 添付ファイル（PDF、ドキュメントなど）
- **匿名投稿**：プライバシー保護のための匿名投稿機能

### 🛍️ キャンパスフリマ（Items）

- **出品・購入**：中古品の出品・購入（教科書、家電など）
- **カテゴリ分類**：教科書、家電、その他
- **高度なフィルタリング**：カテゴリ、ステータス、価格でフィルタリング
- **出品管理**：
  - 出品アイテムの編集
  - 出品アイテムの削除
  - リアルタイムなステータス更新
- **価格設定**：任意の価格を設定可能

### 🧪 研究室情報（Labs）

- **研究室一覧**：各研究室の情報を閲覧
- **体験談**：研究室メンバーからの体験談やレビューを読む
- **検索機能**：興味に合った研究室を見つける

### 💼 就活情報（Jobs）

- **就活体験談**：先輩学生の就活体験談やインサイトにアクセス
- **面接情報**：面接体験から学ぶ
- **企業情報**：企業・職種情報の共有

### 👤 ユーザー管理

- **認証システム**：
  - ユーザー登録（メールアドレス、パスワード）
  - ログイン・ログアウト（JWT トークンベース）
  - 安全なパスワードハッシュ（Argon2）
- **プロフィール管理**：
  - アバター画像のアップロード
  - カバー画像の設定
  - 自己紹介文の編集
  - 学年情報の設定
- **フォローシステム**：
  - ユーザーのフォロー/フォロー解除
  - フォロワー/フォロー中リストの表示
  - プロフィールページにフォロワー数・フォロー中数を表示

### 🔔 通知システム

- **リアルタイム通知**：
  - いいね通知
  - コメント通知
  - フォロー通知
  - メッセージ通知
- **通知管理**：
  - 既読/未読状態の管理（個別・一括）
  - フィルタリング機能付き通知センター
  - 関連コンテンツへのスマートナビゲーション

### 💬 メッセージング・チャット

- **直接メッセージ**：ユーザー間の直接メッセージ
- **アイテム専用チャット**：フリマ取引用のアイテム専用チャット
- **リアルタイム配信**：リアルタイムメッセージ配信

### 🏆 実績バッジシステム

- **バッジ獲得**：活動と実績に基づいてバッジを獲得
- **バッジ種類**：
  - 🥚 初投稿（First Post）
  - ⭐ 夜更かしの秀才（Night Owl）
  - 🔥 継続の達人（Streak Poster）
  - 💬 マルチリンガル（Polyglot）
  - ❤️ ハートコレクター（Heart Collector）
  - 👑 コメント王（Comment King）
  - 🛍️ トップセラー（Top Seller）
  - その他多数
- **プロフィール表示**：プロフィールページにバッジを表示

### 📱 プログレッシブ Web アプリ（PWA）

- **インストール可能**：モバイルアプリとしてインストール可能
- **オフラインサポート**：Service Worker によるオフラインサポート
- **レスポンシブデザイン**：すべてのデバイスに対応したレスポンシブデザイン

---

## 🛠️ 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|----------|------|
| **React** | 19.2.0 | モダンな UI ライブラリ |
| **Vite** | 7.2.4 | 超高速ビルドツール |
| **React Router** | 7.9.6 | クライアントサイドルーティング（HashRouter for GitHub Pages） |
| **Axios** | 1.13.2 | HTTP クライアント |
| **Context API** | - | 状態管理（認証、言語、投稿データ） |
| **lucide-react** | 0.555.0 | アイコンライブラリ |

### バックエンド

| 技術 | バージョン | 用途 |
|------|----------|------|
| **FastAPI** | 0.104.1 | 高性能 Python Web フレームワーク |
| **PostgreSQL** | - | 堅牢なリレーショナルデータベース |
| **SQLAlchemy** | 2.0.23 | モダンな Python ORM |
| **Pydantic** | 2.9.2 | データバリデーション |
| **JWT** | - | 安全なトークンベース認証 |
| **Argon2** | - | パスワードハッシュアルゴリズム |
| **Bleach** | 6.1.0 | HTML サニタイゼーション |
| **Uvicorn** | 0.24.0 | ASGI サーバー |

### ストレージ・キャッシュ

| 技術 | 用途 | 備考 |
|------|------|------|
| **Supabase Storage** | ファイル・画像用オブジェクトストレージ | HTTP API 経由（推奨） |
| **Cloudinary** | 代替画像ストレージ | 25GB 無料プラン |
| **MinIO** | セルフホスト型オブジェクトストレージ | 開発・テスト環境向け |
| **Redis** | キャッシュとレート制限 | オプション（`REDIS_ENABLED=false` で無効化可能） |

### インフラ・DevOps

| 技術 | 用途 |
|------|------|
| **Docker** | コンテナ化 |
| **Docker Compose** | マルチコンテナオーケストレーション |
| **GitHub Pages** | フロントエンド静的ホスティング |
| **Render** | バックエンドとデータベースホスティング |
| **GitHub Actions** | CI/CD 自動化 |

---

## 🚀 クイックスタート

### 前提条件

- **Docker** と **Docker Compose** がインストールされていること
- **Node.js** 18 以上がインストールされていること
- **Git** がインストールされていること
- **Python** 3.11 以上（ローカル開発の場合）

### 1. リポジトリのクローン

```bash
git clone https://github.com/syokan00/Database_Final.git
cd Database_Final
```

### 2. バックエンドのセットアップ

#### 環境変数の設定

プロジェクトルートに `.env` ファイルを作成：

```bash
# Windows
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

#### データベースオプション

**オプション A: 共有デモデータベースを使用（読み取り専用）**

```env
DATABASE_URL=postgresql://readonly_demo:demo_readonly_2025@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

⚠️ **注意**: これは読み取り専用です。投稿を閲覧できますが、登録やコンテンツ作成はできません。

**オプション B: ローカルデータベースを使用（完全な機能）**

```env
DATABASE_URL=postgresql://postgres:changeme@db:5432/memoluck
```

この方法では、データはローカルのみに保存され、他のコンピューターとは共有されません。

#### ストレージ設定（アップロード機能に必須）

**Supabase Storage を使用する場合（推奨）：**

```env
STORAGE_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_BUCKET=memoluck-files
```

**Cloudinary を使用する場合：**

```env
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**MinIO を使用する場合（開発環境）：**

```env
STORAGE_TYPE=minio
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=memoluck-files
MINIO_EXTERNAL_URL=http://localhost:9002
MINIO_SECURE=false
```

詳細な設定方法は [ストレージ設定ガイド](docs/Infra/quick-storage-setup.md) を参照してください。

#### その他の環境変数

```env
# JWT 認証用シークレット
JWT_SECRET=your-jwt-secret-key-here

# Redis 設定（オプション）
REDIS_ENABLED=false
REDIS_URL=redis://redis:6379/0

# CORS 設定
CORS_ORIGINS=http://localhost:5173,https://syokan00.github.io
```

#### バックエンドサービスの起動

```bash
docker-compose up -d
```

バックエンドは `http://localhost:8000` で利用可能になります。

API ドキュメントは `http://localhost:8000/docs` でアクセスできます。

### 3. フロントエンドのセットアップ

#### 依存関係のインストール

```bash
cd frontend
npm install
```

#### 開発サーバーの起動

```bash
npm run dev
```

フロントエンド開発サーバー: `http://localhost:5173`

#### 本番ビルド

```bash
npm run build
```

ビルドされたファイルは `frontend/dist` に生成されます。

---

## 🌐 デプロイメント

### 本番環境

- **フロントエンド**: [GitHub Pages](https://syokan00.github.io/Database_Final/)
- **バックエンド API**: Render.com
- **データベース**: Render PostgreSQL
- **ストレージ**: Supabase Storage / Cloudinary

### デプロイメント手順

#### フロントエンド（GitHub Pages）

1. GitHub Actions が自動的にデプロイします
2. `main` ブランチへのプッシュで自動デプロイがトリガーされます
3. 詳細は [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) を参照

#### バックエンド（Render）

1. Render で Web Service を作成
2. 環境変数を設定（`DATABASE_URL`, `STORAGE_TYPE`, `SUPABASE_URL` など）
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

詳細なデプロイメントガイドは [docs/Infra/](docs/Infra/) を参照してください：

- [完全なデプロイメントガイド](docs/Infra/deployment.md)
- [ストレージ設定ガイド](docs/Infra/quick-storage-setup.md)
- [Supabase Storage 権限設定](docs/Infra/supabase-storage-permissions-fix.md)
- [トラブルシューティングガイド](docs/Infra/storage-troubleshooting.md)

---

## 📁 プロジェクト構成

```
Database_Final/
├── frontend/                      # React フロントエンドアプリケーション
│   ├── src/
│   │   ├── components/           # 再利用可能な UI コンポーネント
│   │   │   ├── Navbar.jsx        # ナビゲーションバー
│   │   │   ├── PostCard.jsx      # 投稿カード
│   │   │   ├── ItemCard.jsx      # アイテムカード
│   │   │   └── ...
│   │   ├── contexts/             # React Context プロバイダー
│   │   │   ├── AuthContext.jsx   # 認証状態管理
│   │   │   ├── PostContext.jsx   # 投稿データ管理
│   │   │   └── LanguageContext.jsx
│   │   ├── pages/                # ページコンポーネント
│   │   │   ├── HomePage.jsx      # ホームページ
│   │   │   ├── NotesPage.jsx     # 経験談一覧
│   │   │   ├── ItemsPage.jsx     # フリマ一覧
│   │   │   ├── CreatePost.jsx    # 投稿作成
│   │   │   ├── ProfilePage.jsx   # プロフィール
│   │   │   └── ...
│   │   ├── api/                  # API クライアントユーティリティ
│   │   │   └── client.js         # Axios クライアント設定
│   │   ├── utils/                # ヘルパー関数
│   │   │   └── pwa.js            # PWA ユーティリティ
│   │   ├── App.jsx               # アプリケーションエントリーポイント
│   │   └── main.jsx              # React エントリーポイント
│   ├── public/                   # 静的アセット
│   │   ├── 404.html              # 404 ページ（GitHub Pages 用）
│   │   ├── sw.js                 # Service Worker
│   │   └── manifest.json         # PWA マニフェスト
│   ├── package.json
│   └── vite.config.js            # Vite 設定
│
├── backend/                       # FastAPI バックエンドアプリケーション
│   ├── app/
│   │   ├── main.py               # アプリケーションエントリーポイント
│   │   ├── models.py             # データベースモデル
│   │   ├── schemas.py            # Pydantic スキーマ
│   │   ├── database.py           # データベース接続設定
│   │   ├── auth.py               # 認証エンドポイント
│   │   ├── posts.py              # 投稿管理 API
│   │   ├── items.py              # フリマアイテム API
│   │   ├── comments.py           # コメント API
│   │   ├── users.py              # ユーザー管理 API
│   │   ├── uploads.py            # ファイルアップロード処理
│   │   ├── storage.py            # ストレージ抽象化レイヤー
│   │   ├── notifications.py      # 通知 API
│   │   ├── messages.py           # メッセージング API
│   │   ├── badges.py             # バッジ API
│   │   ├── favorites.py          # お気に入り API
│   │   ├── services/             # ビジネスロジック
│   │   │   └── badge_service.py  # バッジサービス
│   │   └── utils/                # ユーティリティ
│   │       └── restriction_validators.py
│   ├── requirements.txt          # Python 依存関係
│   ├── runtime.txt               # Python バージョン指定
│   └── Dockerfile                # Docker イメージ定義
│
├── docs/                          # プロジェクトドキュメント
│   ├── BA/                       # ビジネス分析
│   ├── Architect/                # システムアーキテクチャ
│   ├── DBA/                      # データベース管理
│   ├── Infra/                    # インフラ・デプロイメント
│   └── PM/                       # プロジェクト管理
│
├── .github/                       # GitHub 設定
│   └── workflows/
│       └── deploy-pages.yml      # GitHub Actions ワークフロー
│
├── docker-compose.yml             # Docker Compose 設定
├── .env.example                   # 環境変数サンプル
└── README.md                      # このファイル
```

---

## 📡 API ドキュメント

バックエンドが起動している場合、以下のエンドポイントで API ドキュメントにアクセスできます：

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### 主要 API エンドポイント

#### 認証
- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ログイン
- `GET /api/auth/me` - 現在のユーザー情報取得

#### 投稿
- `GET /api/posts/` - 投稿一覧取得
- `POST /api/posts/` - 投稿作成
- `GET /api/posts/{id}` - 投稿詳細取得
- `PUT /api/posts/{id}` - 投稿更新
- `DELETE /api/posts/{id}` - 投稿削除
- `POST /api/posts/{id}/like` - いいね
- `DELETE /api/posts/{id}/like` - いいね解除

#### アイテム（フリマ）
- `GET /api/items/` - アイテム一覧取得
- `POST /api/items/` - アイテム出品
- `GET /api/items/{id}` - アイテム詳細取得
- `PUT /api/items/{id}` - アイテム更新
- `DELETE /api/items/{id}` - アイテム削除

#### ファイルアップロード
- `POST /api/uploads/avatar` - アバター画像アップロード
- `POST /api/uploads/cover` - カバー画像アップロード
- `POST /api/uploads/post-image` - 投稿画像アップロード
- `POST /api/uploads/file` - 一般ファイルアップロード

#### 通知
- `GET /api/notifications/` - 通知一覧取得
- `GET /api/notifications/unread/count` - 未読通知数取得
- `PUT /api/notifications/{id}/read` - 通知を既読に

---

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. データベース接続エラー

**問題**: `database "memoluck" does not exist`

**解決方法**:
- データベースが自動的に作成されますが、作成に失敗した場合は Render PostgreSQL で手動で作成してください
- または、`postgres` データベースを使用するように `DATABASE_URL` を変更してください

詳細は [データベース接続トラブルシューティング](docs/Infra/database-connection-troubleshooting.md) を参照

#### 2. ファイルアップロードエラー（503 Service Unavailable）

**問題**: ファイルアップロード時に 503 エラーが発生

**解決方法**:
1. `STORAGE_TYPE` 環境変数が正しく設定されているか確認
2. Supabase Storage の場合、ストレージバケットの RLS ポリシーを設定してください
   - 詳細は [Supabase Storage 権限設定ガイド](docs/Infra/supabase-storage-permissions-fix.md) を参照

詳細は [ストレージトラブルシューティング](docs/Infra/storage-troubleshooting.md) を参照

#### 3. Redis 接続エラー

**問題**: `redis.exceptions.ConnectionError`

**解決方法**:
- Redis はオプションです。`REDIS_ENABLED=false` を環境変数に設定することで無効化できます
- 詳細は [Redis オプション設定](docs/Infra/redis-optional-fix.md) を参照

#### 4. GitHub Pages で 404 エラー

**問題**: `/profile` などのパスで 404 エラーが発生

**解決方法**:
- GitHub Pages は静的ホスティングのため、HashRouter を使用しています
- URL は `/#/profile` の形式になります（自動的にリダイレクトされます）
- 詳細は [GitHub Pages ルーティング解決方法](docs/Infra/github-pages-routing-final-solution.md) を参照

#### 5. Python バージョンエラー（Render）

**問題**: Render で Python 3.13 を使用しているが、pydantic-core のビルドに失敗

**解決方法**:
- `backend/runtime.txt` に `python-3.11.10` を指定
- または、Render の環境変数に `PYTHON_VERSION=3.11.10` を設定
- 詳細は [Render Python バージョン修正](docs/Infra/render-python-version-fix.md) を参照

### ログの確認方法

#### バックエンドログ
```bash
docker-compose logs backend
```

#### フロントエンドログ
ブラウザの開発者ツール（F12）のコンソールを確認

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
- [Supabase Storage 権限設定](docs/Infra/supabase-storage-permissions-fix.md)
- [トラブルシューティング](docs/Infra/storage-troubleshooting.md)

---

## 🔒 セキュリティ機能

- **パスワードセキュリティ**: Argon2 ハッシュアルゴリズム（最新の安全なパスワードハッシュ）
- **認証**: JWT トークンベース認証（安全なトークンベース認証）
- **CORS 保護**: 設定可能なクロスオリジンリクエスト制限
- **レート制限**: Redis ベースのレート制限（オプション、DDoS 対策）
- **SQL インジェクション対策**: SQLAlchemy ORM によるパラメータ化クエリ
- **入力バリデーション**: Pydantic スキーマによる型安全なデータバリデーション
- **コンテンツサニタイゼーション**: Bleach による HTML サニタイゼーション（XSS 対策）

---

## 👥 メンバー（チーム名: luckyfouru）

- **2442043** - 杉浦芙美子（Sugiura Fumiko）
- **2442053** - 竹髙 結衣（Takehaka Yui）
- **2442097** - 林 子嫻（Lin Zixian）
- **2442103** - 小栗 花音（Oguri Kano）

---

## 🤝 コントリビューション

このプロジェクトは教育目的で作成されました。質問や提案がある場合は、GitHub の Issues でお知らせください。

### コントリビューション方法

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を開く

---

## 🔗 リンク

- **公開アプリケーション**: https://syokan00.github.io/Database_Final/
- **GitHub リポジトリ**: https://github.com/syokan00/Database_Final
- **API ドキュメント**: バックエンド実行時に `http://localhost:8000/docs` で利用可能
- **本番 API**: https://memolucky-backend.onrender.com/docs

---

## 📄 ライセンス

このプロジェクトは教育目的で作成されました。

---

## 🙏 謝辞

- FastAPI コミュニティ
- React コミュニティ
- すべてのオープンソースコントリビューター

---

**MemoLucky** - Lucky for you — あなたに届く、誰かの経験。🍀
