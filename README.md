# MemoLucky 🍀

**Lucky for you — あなたに届く、誰かの経験。**

> 大学生向けキャンパスライフ支援プラットフォーム

[![Live Demo](https://img.shields.io/badge/Demo-公開中-brightgreen)](https://syokan00.github.io/Database_Final/)
[![GitHub](https://img.shields.io/badge/GitHub-リポジトリ-blue)](https://github.com/syokan00/Database_Final)

## 📖 プロジェクト概要

**MemoLucky** は、大学生がキャンパスライフで必要な情報を共有し、助け合えるコミュニティを構築することを目的とした Web アプリケーションです。先輩たちのリアルな経験談、フリマ、研究室情報、就活情報などを一元的に管理・閲覧できます。

### ビジョン
**"Lucky for you — あなたに届く、誰かの経験。"**

私たちは、同じ道を歩んできた人々が共有する実体験から、最も価値のある知識が生まれると信じています。MemoLucky は、大学の異なる段階にいる学生たちの間のギャップを埋める架け橋となります。

---

## ✨ 主要機能

### 📝 経験談共有（Notes）
- 先輩の実体験を投稿・閲覧
- タグ、カテゴリ、キーワードで検索・フィルタリング
- いいね・お気に入り機能
- コメント機能とディスカッション
- リッチメディア対応（画像、添付ファイル）

### 🛍️ キャンパスフリマ（Items）
- 中古品の出品・購入（教科書、家電など）
- アイテムカテゴリ：教科書、家電、その他
- カテゴリ、ステータス、価格での高度なフィルタリング
- 出品アイテムの編集・管理
- リアルタイムなアイテムステータス更新

### 🧪 研究室情報（Labs）
- 各研究室の情報を閲覧
- 研究室メンバーからの体験談やレビューを読む
- 興味に合った研究室を見つける

### 💼 就活情報（Jobs）
- 就活体験談やインサイトにアクセス
- 先輩学生の面接体験から学ぶ
- 企業・職種情報の共有

### 👤 ユーザー管理
- 安全なユーザー登録・ログイン（JWT 認証）
- 包括的なプロフィール管理（アバター、カバー画像、自己紹介）
- ユーザープロフィール閲覧とフォローシステム
- フォロワー/フォロー中リスト

### 🔔 通知システム
- いいね、コメント、フォロー、メッセージのリアルタイム通知
- 既読/未読状態の管理（個別・一括）
- 関連コンテンツへのスマートナビゲーション
- フィルタリング機能付き通知センター

### 💬 メッセージング・チャット
- ユーザー間の直接メッセージ
- フリマ取引用のアイテム専用チャット
- リアルタイムメッセージ配信

### 🏆 実績バッジシステム
- 活動と実績に基づいてバッジを獲得
- バッジには以下が含まれます：初投稿、夜更かしの秀才、継続の達人、マルチリンガル、ハートコレクター、コメント王、トップセラーなど
- プロフィールにバッジを表示

### 🌐 国際化対応
- 多言語サポート（日本語、中国語、英語）
- 言語切り替えインターフェース

### 📱 プログレッシブ Web アプリ（PWA）
- モバイルアプリとしてインストール可能
- Service Worker によるオフラインサポート
- すべてのデバイスに対応したレスポンシブデザイン

---

## 🛠️ 技術スタック

### フロントエンド
- **React** 19.2.0 - モダンな UI ライブラリ
- **Vite** 7.2.4 - 超高速ビルドツール
- **React Router** 7.9.6 - クライアントサイドルーティング（GitHub Pages 互換性のため HashRouter を使用）
- **Axios** 1.13.2 - HTTP クライアント
- **Context API** - 状態管理（認証、言語、投稿データ）
- **PWA** - オフラインサポート用 Service Worker

### バックエンド
- **FastAPI** 0.104.1 - 高性能 Python Web フレームワーク
- **PostgreSQL** - 堅牢なリレーショナルデータベース
- **SQLAlchemy** 2.0.23 - モダンな Python ORM
- **Pydantic** 2.9.2 - データバリデーション
- **JWT** - 安全なトークンベース認証
- **Argon2** - パスワードハッシュアルゴリズム

### ストレージ・キャッシュ
- **Supabase Storage** - ファイル・画像用オブジェクトストレージ（HTTP API 経由）
- **Cloudinary** - 代替画像ストレージ（25GB 無料プラン）
- **MinIO** - セルフホスト型オブジェクトストレージオプション
- **Redis** 5.0.1 - キャッシュとレート制限（オプション）

### インフラ・DevOps
- **Docker** - コンテナ化
- **Docker Compose** - マルチコンテナオーケストレーション
- **GitHub Pages** - フロントエンド静的ホスティング
- **Render** - バックエンドとデータベースホスティング
- **GitHub Actions** - CI/CD 自動化

---

## 🚀 クイックスタート

### 前提条件
- **Docker** と **Docker Compose** がインストールされていること
- **Node.js** 18 以上がインストールされていること
- **Git** がインストールされていること

### 1. リポジトリのクローン
```bash
git clone https://github.com/syokan00/Database_Final.git
cd Database_Final
```

### 2. バックエンドのセットアップ

#### 環境変数の設定
プロジェクトルートに `.env` ファイルを作成：

```bash
# サンプルファイルをコピー
cp .env.example .env  # Linux/Mac
# または
Copy-Item .env.example .env  # Windows
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

#### ストレージ設定（アップロード機能に必須）
```env
STORAGE_TYPE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_BUCKET=memoluck-files
```

詳細な設定方法は [ストレージ設定ガイド](docs/Infra/quick-storage-setup.md) を参照してください。

#### バックエンドサービスの起動
```bash
docker-compose up -d
```
バックエンドは `http://localhost:8000` で利用可能になります。

### 3. フロントエンドのセットアップ

```bash
cd frontend
npm install
npm run dev
```
フロントエンド開発サーバー: `http://localhost:5173`

---

## 🌐 デプロイメント

### 本番環境

- **フロントエンド**: [GitHub Pages](https://syokan00.github.io/Database_Final/)
- **バックエンド API**: Render.com
- **データベース**: Render PostgreSQL
- **ストレージ**: Supabase Storage / Cloudinary

### デプロイメントドキュメント
詳細なデプロイメントガイドは [docs/Infra/](docs/Infra/) にあります：
- [完全なデプロイメントガイド](docs/Infra/deployment.md)
- [ストレージ設定ガイド](docs/Infra/quick-storage-setup.md)
- [トラブルシューティングガイド](docs/Infra/storage-troubleshooting.md)

---

## 📁 プロジェクト構成

```
Database_Final/
├── frontend/                 # React フロントエンドアプリケーション
│   ├── src/
│   │   ├── components/      # 再利用可能な UI コンポーネント
│   │   ├── contexts/        # React Context プロバイダー
│   │   ├── pages/          # ページコンポーネント
│   │   ├── api/            # API クライアントユーティリティ
│   │   ├── i18n/           # 国際化
│   │   └── utils/          # ヘルパー関数
│   ├── public/             # 静的アセット
│   └── package.json
│
├── backend/                 # FastAPI バックエンドアプリケーション
│   ├── app/
│   │   ├── main.py         # アプリケーションエントリーポイント
│   │   ├── models.py       # データベースモデル
│   │   ├── schemas.py      # Pydantic スキーマ
│   │   ├── auth.py         # 認証エンドポイント
│   │   ├── posts.py        # 投稿管理
│   │   ├── items.py        # フリマアイテム
│   │   ├── uploads.py      # ファイルアップロード処理
│   │   ├── storage.py      # ストレージ抽象化レイヤー
│   │   └── ...            # その他の API モジュール
│   ├── requirements.txt
│   └── Dockerfile
│
├── docs/                    # プロジェクトドキュメント
│   ├── BA/                 # ビジネス分析
│   ├── Architect/          # システムアーキテクチャ
│   ├── DBA/                # データベース管理
│   ├── Infra/              # インフラ・デプロイメント
│   └── PM/                 # プロジェクト管理
│
├── docker-compose.yml       # Docker Compose 設定
└── README.md               # このファイル
```

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
- [トラブルシューティング](docs/Infra/storage-troubleshooting.md)

---

## 🔒 セキュリティ機能

- **パスワードセキュリティ**: Argon2 ハッシュアルゴリズム
- **認証**: JWT トークンベース認証
- **CORS 保護**: 設定可能なクロスオリジンリクエスト制限
- **レート制限**: Redis ベースのレート制限（オプション）
- **SQL インジェクション対策**: パラメータ化クエリを使用した SQLAlchemy ORM
- **入力バリデーション**: Pydantic スキーマバリデーション
- **コンテンツサニタイゼーション**: HTML サニタイゼーション用 Bleach

---

## 👥 メンバー（チーム名: luckyfouru）

- **2442043** - 杉浦芙美子（Sugiura Fumiko）
- **2442053** - 竹髙 結衣（Takehaka Yui）
- **2442097** - 林 子嫻（Lin Zixian）
- **2442103** - 小栗 花音（Oguri Kano）

---

## 🤝 コントリビューション

このプロジェクトは教育目的で作成されました。質問や提案がある場合は、GitHub の Issues でお知らせください。

---

## 🔗 リンク

- **公開アプリケーション**: https://syokan00.github.io/Database_Final/
- **GitHub リポジトリ**: https://github.com/syokan00/Database_Final
- **API ドキュメント**: バックエンド実行時に `/docs` エンドポイントで利用可能

---

## 📄 ライセンス

このプロジェクトは教育目的で作成されました。

---

**MemoLucky** - Lucky for you — あなたに届く、誰かの経験。🍀
