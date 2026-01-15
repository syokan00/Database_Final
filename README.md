# MemoLucky

**Lucky for you — あなたに届く、誰かの経験。**

大学生向けキャンパスライフ支援プラットフォーム

## プロジェクト概要

MemoLucky は、大学生がキャンパスライフで必要な情報を共有し、助け合えるコミュニティを構築することを目的とした Web アプリケーションです。先輩たちのリアルな経験談、フリマ、研究室情報、就活情報などを一元的に管理・閲覧できます。

## 主要機能

### 1. 経験談（Notes）
- 先輩の経験談を投稿・閲覧
- タグやカテゴリで検索・フィルタリング
- いいね機能

### 2. フリマ（Items）
- 中古品の出品・閲覧
- 出品アイテムの編集・削除
- カテゴリやステータスでフィルタリング

### 3. 研究室情報（Labs）
- 各研究室の情報や先輩の体験談を閲覧

### 4. 就活情報（Jobs）
- 先輩の就活体験談や選考情報を閲覧

### 5. ユーザー管理
- ユーザー登録・ログイン（JWT 認証）
- プロフィール管理
- 他ユーザーのプロフィール閲覧

### 6. 通知システム
- いいね、お気に入り、フォロー、コメント、メッセージの通知
- 通知の既読管理（個別・一括）
- 通知クリックで適切なページへ自動遷移

### 7. フォロー機能
- ユーザー間のフォロー/フォロー解除
- フォロワー/フォロー中リストの表示
- プロフィールページにフォロワー数とフォロー中数を表示

### 8. 商品チャット
- 商品に関するメッセージング機能
- 売り手と買い手の両方に対応
- チャット相手のプロフィール閲覧

### 9. バッジシステム
- 投稿数や活動に応じたバッジ獲得
- 初投稿、深夜の秀才、継続の達人、マルチリンガル、人気者、コメント王、トップセラーなど

## 技術スタック

### フロントエンド
- **React** 19.2.0 - UI コンポーネントライブラリ
- **Vite** 7.2.4 - 高速ビルドツール
- **React Router** 7.9.6 - クライアントサイドルーティング（HashRouter）
- **Axios** 1.13.2 - HTTP クライアント
- **Context API** - 状態管理（認証、言語、投稿データ）

### バックエンド
- **FastAPI** 0.104.1 - Python Web フレームワーク
- **PostgreSQL** - リレーショナルデータベース
- **SQLAlchemy** 2.0.23 - ORM
- **MinIO** 7.2.0 - オブジェクトストレージ（画像保存）
- **Redis** 5.0.1 - キャッシュ・レート制限
- **JWT** - 認証トークン
- **Argon2** - パスワードハッシュ

### インフラ
- **Docker** - コンテナ化
- **Docker Compose** - マルチコンテナ管理
- **GitHub Pages** - フロントエンドの静的ホスティング
- **GitHub Actions** - CI/CD

## ローカル環境での実行方法

### 前提条件
- Docker と Docker Compose がインストールされていること
- Node.js 18 以上がインストールされていること
- Git がインストールされていること

### 1. リポジトリのクローン
```bash
git clone https://github.com/syokan00/Database_Final.git
cd Database_Final
```

### 2. バックエンドのセットアップ ⚠️ 重要

**注意**: バックエンドサービスが起動していないと、ログイン・登録ができません。

#### 環境変数の設定（オプション）

もし手動で設定したい場合のみ：

**Windows**:
```bash
cd backend
copy env.example .env
```

**Linux/Mac**:
```bash
cd backend
cp env.example .env
```

#### Docker Compose の起動（必須）
```bash
cd ..
# プロジェクトルートで実行
docker-compose up -d
```
`http://localhost:3000` で起動します。


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

開発サーバーは `http://localhost:5173` で起動します。


##  デプロイメント

### GitHub Pages
フロントエンドは GitHub Pages に自動デプロイされています。

**公開 URL**: https://syokan00.github.io/Database_Final/

### デプロイメント方法
詳細は [docs/Infra/deployment.md](docs/Infra/deployment.md) を参照してください。

## 📁 プロジェクト構成

```
Database_Final/
├── frontend/              # フロントエンド（React + Vite）
│   ├── src/
│   │   ├── components/   # React コンポーネント
│   │   ├── contexts/     # Context API（状態管理）
│   │   ├── pages/        # ページコンポーネント
│   │   ├── i18n/         # 国際化ファイル（日本語）
│   │   └── utils/        # ユーティリティ関数
│   ├── public/           # 静的ファイル
│   └── package.json
├── backend/              # バックエンド（FastAPI）
│   ├── app/
│   │   ├── main.py       # アプリケーションエントリーポイント
│   │   ├── posts.py      # 投稿関連 API
│   │   ├── items.py      # 出品関連 API
│   │   ├── auth.py       # 認証関連 API
│   │   ├── models.py     # データベースモデル
│   │   └── schemas.py    # Pydantic スキーマ
│   ├── requirements.txt
│   └── Dockerfile
├── docs/                 # ドキュメント
│   ├── BA/              # Business Analyst 関連
│   ├── Architect/       # アーキテクト関連
│   ├── DBA/             # DBA 関連
│   ├── Infra/           # インフラ関連
│   └── PM/              # プロジェクトマネージャー関連
├── docker-compose.yml   # Docker Compose 設定
└── README.md            # このファイル
```

## ドキュメント

### プロジェクト管理
- [アプリケーション概要](docs/PM/app-overview.md)
- [プロジェクト報告書](docs/PM/project-report.md)
- [デモ動画](docs/PM/demo-video.md)

### 機能ドキュメント
- [通知・ソーシャル機能の実装](docs/features/notification-and-social-features.md)

### ビジネス分析
- [ペルソナ](docs/BA/persona.md)
- [モチベーショングラフ](docs/BA/motivation-graph.md)
- [ストーリーボード](docs/BA/storyboard.md)
- [UI モック](docs/BA/ui-mock.md)

### アーキテクチャ
- [システムアーキテクチャ](docs/Architect/system-architecture.md)
- [RPO/RTO 定義](docs/Architect/rpo-rto.md)
- [DR/バックアップ戦略](docs/Architect/dr-backup.md)
- [パフォーマンス指標](docs/Architect/performance.md)

### データベース
- [ER 図](docs/DBA/er-diagram.md)

### インフラ
- [デプロイメント](docs/Infra/deployment.md)


##  セキュリティ

- パスワードは Argon2 でハッシュ化
- JWT トークンベースの認証
- CORS 設定によるクロスオリジンリクエストの制限
- レート制限（Redis を使用）
- SQL インジェクション対策（SQLAlchemy ORM）

##  ライセンス

このプロジェクトは教育目的で作成されました。

##  コントリビューター

- [syokan00](https://github.com/syokan00)

## リンク

- **GitHub リポジトリ**: https://github.com/syokan00/Database_Final
- **デプロイ先**: https://syokan00.github.io/Database_Final/

## お問い合わせ

プロジェクトに関する質問や提案は、GitHub の Issues までお願いします。

---

**MemoLucky** - Lucky for you — あなたに届く、誰かの経験。
