# デプロイメントドキュメント

## 概要

本ドキュメントでは、MemoLucky アプリケーションのデプロイメント方法を説明します。現在は開発・展示用途として、フロントエンドを GitHub Pages にデプロイし、バックエンドはローカル Docker 環境で動作させています。

## デプロイメント構成

### フロントエンド
- **ホスティング**: GitHub Pages（静的ホスティング）
- **URL**: https://syokan00.github.io/Database_Final/
- **ビルドツール**: Vite
- **ルーティング**: HashRouter（GitHub Pages 対応）

### バックエンド（開発環境）
- **ホスティング**: ローカル Docker Compose
- **コンテナ**: FastAPI、PostgreSQL、MinIO、Redis
- **データベース**: ローカル PostgreSQL または Supabase クラウドデータベース
- **用途**: 開発・テスト用

## ローカル開発環境のセットアップ

### 前提条件
- Docker と Docker Compose がインストールされていること
- Node.js 18 以上がインストールされていること
- Git がインストールされていること

### 1. リポジトリのクローン
```bash
git clone https://github.com/syokan00/Database_Final.git
cd Database_Final
```

### 2. バックエンド環境のセットアップ

#### 2.1 環境変数の設定

**方法A：共有デモデータベースを使用（推奨 - 他の人が投稿した内容を閲覧可能）**

プロジェクトルートで `.env` ファイルを作成：
```bash
# Windows
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

`.env` ファイルを開き、以下の行が有効になっていることを確認：
```env
DATABASE_URL=postgresql://readonly_demo:demo_readonly_2024@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

⚠️ **注意**: これは読み取り専用データベースです。他のユーザーの投稿を閲覧できますが、ユーザー登録や投稿はできません。

**方法B：ローカルデータベースを使用（完全な機能、データは共有されません）**

`.env` ファイルでローカルデータベースの行のコメントを解除：
```env
DATABASE_URL=postgresql://postgres:changeme@db:5432/memoluck
```

**方法C：完全アクセス共有データベース（プロジェクトメンテナーに問い合わせ）**

完全な機能（登録、投稿など）が必要な場合、プロジェクトメンテナーに連絡して接続文字列を取得してください。

#### 環境変数の完全なリスト

`.env.example` ファイルには以下の環境変数が含まれています：

```env
# データベース設定（上記のいずれかを選択）
DATABASE_URL=postgresql://...

# ローカルデータベース設定（Option 1 を選択した場合のみ使用）
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme
POSTGRES_DB=memoluck

# Redis 設定
REDIS_URL=redis://redis:6379/0

# MinIO 設定
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=changeme
MINIO_BUCKET=memoluck-files

# JWT 設定
JWT_SECRET=changeme-in-production
```

#### 2.2 Docker Compose の起動
```bash
# プロジェクトルートで実行
docker-compose up -d
```

これにより、以下のコンテナが起動します：
- PostgreSQL（ポート 5432）
- MinIO（ポート 9000, 9001）
- Redis（ポート 6379）
- FastAPI（ポート 8000）

#### 2.3 データベースの初期化

**自動マイグレーション（推奨）**

バックエンド起動時に自動的にデータベースマイグレーションが実行されます。以下のログで確認できます：

```bash
docker-compose logs backend | Select-String "migration"
# または Linux/Mac: docker-compose logs backend | grep "migration"
```

`Database migration completed successfully` が表示されれば成功です。

**手動マイグレーション（Supabase を使用する場合）**

Supabase クラウドデータベースを使用する場合は、Supabase Dashboard → SQL Editor で `db/init.sql` の内容を実行してください。

### 3. フロントエンド環境のセットアップ

#### 3.1 依存関係のインストール
```bash
cd frontend
npm install
```

#### 3.2 環境変数の設定
```bash
# .env ファイルを作成（オプション）
echo "VITE_API_URL=http://localhost:8000" > .env
```

#### 3.3 開発サーバーの起動
```bash
npm run dev
```

開発サーバーは `http://localhost:5173` で起動します。

## GitHub Pages へのデプロイメント

### 1. GitHub Actions ワークフローの確認

`.github/workflows/deploy-pages.yml` が存在することを確認します。このワークフローは、`main` ブランチにプッシュされると自動的にフロントエンドをビルドし、GitHub Pages にデプロイします。

### 2. GitHub Pages の設定

1. GitHub リポジトリの **Settings** → **Pages** にアクセス
2. **Source** を **GitHub Actions** に設定
3. **Save** をクリック

### 3. デプロイメントの実行

```bash
# 変更をコミット
git add .
git commit -m "Update frontend"

# main ブランチにプッシュ
git push origin main
```

GitHub Actions が自動的にビルドとデプロイを実行します。デプロイが完了すると、以下の URL でアクセスできます：
- https://syokan00.github.io/Database_Final/

### 4. デプロイメントの確認

1. GitHub リポジトリの **Actions** タブでワークフローの実行状況を確認
2. デプロイが成功したら、GitHub Pages の URL にアクセスして動作確認

## ビルド設定

### フロントエンドのビルド設定

`frontend/vite.config.js` で以下の設定を行っています：

```javascript
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages デプロイ用の base パス
  base: mode === 'production' ? '/Database_Final/' : '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
}))
```

### バックエンドのビルド設定

`docker-compose.yml` でバックエンドのビルドと実行を定義しています。

## 環境変数の管理

### フロントエンド
- 開発環境: `.env` ファイル（Git にコミットしない）
- 本番環境: GitHub Actions の Secrets または Variables で設定

### バックエンド
- 開発環境: `.env` ファイル（プロジェクトルート、Git にコミットしない）
- 本番環境: 環境変数またはシークレット管理サービス（AWS Secrets Manager など）

### 機密情報の扱い
- `.env` ファイルは `.gitignore` に追加されている
- `.env.example` ファイルにテンプレートを用意
- **共有デモデータベースのパスワード**: 読み取り専用のため、公開しても安全です
- **完全アクセスデータベースのパスワード**: 絶対に公開しないでください

### データベース接続オプション

1. **ローカルデータベース** (`DATABASE_URL=postgresql://postgres:changeme@db:5432/memoluck`)
   - データはローカルのみに保存
   - 他のコンピューターとは共有されない
   - 完全な機能が利用可能

2. **共有デモデータベース（読み取り専用）** (`.env.example` にデフォルト設定)
   - 他のユーザーの投稿を閲覧可能
   - ユーザー登録や投稿は不可（読み取り専用）
   - パスワードは公開されており、安全に使用可能

3. **完全アクセス共有データベース** (プロジェクトメンテナーに問い合わせ)
   - 他のユーザーの投稿を閲覧可能
   - ユーザー登録や投稿も可能
   - 接続文字列は非公開（機密情報）

## トラブルシューティング

### 問題 1: GitHub Pages で 404 エラーが発生する

**原因**: `base` パスが正しく設定されていない、または `BrowserRouter` を使用している

**解決策**:
1. `vite.config.js` の `base` を `/Database_Final/` に設定
2. `App.jsx` で `HashRouter` を使用していることを確認

### 問題 2: API 呼び出しが失敗する

**原因**: フロントエンドがバックエンドに接続できない

**解決策**:
1. バックエンドが起動していることを確認（`docker-compose ps`）
2. `VITE_API_URL` 環境変数が正しく設定されていることを確認
3. CORS 設定が正しいことを確認

### 問題 3: Docker コンテナが起動しない

**原因**: ポートが既に使用されている、または Docker が起動していない

**解決策**:
1. Docker が起動していることを確認
2. 使用中のポートを確認（`netstat -an | grep <ポート番号>`）
3. 既存のコンテナを停止（`docker-compose down`）

### 問題 4: ビルドが失敗する

**原因**: 依存関係が不足している、またはビルドエラー

**解決策**:
1. `npm install` を再実行
2. `node_modules` を削除して再インストール
3. ビルドログを確認してエラーを特定

## 本番環境へのデプロイメント（将来の拡張）

### フロントエンド
- **CDN**: Cloudflare、AWS CloudFront など
- **静的ホスティング**: Netlify、Vercel など

### バックエンド
- **クラウドサーバー**: AWS EC2、Google Cloud Compute Engine など
- **コンテナオーケストレーション**: Kubernetes、AWS ECS など
- **サーバーレス**: AWS Lambda、Google Cloud Functions など

### データベース
- **マネージドデータベース**: AWS RDS、Google Cloud SQL など
- **接続プール**: PgBouncer など

### オブジェクトストレージ
- **マネージドストレージ**: AWS S3、Google Cloud Storage など

### CI/CD
- **GitHub Actions**: 現在使用中
- **その他**: GitLab CI/CD、Jenkins など

## デプロイメントチェックリスト

### 初回デプロイ前
- [ ] 環境変数が正しく設定されている
- [ ] `.env` ファイルが `.gitignore` に追加されている
- [ ] 機密情報がリポジトリにコミットされていない
- [ ] Docker コンテナが正常に起動する
- [ ] フロントエンドがローカルで正常に動作する
- [ ] バックエンド API が正常に動作する

### GitHub Pages デプロイ前
- [ ] `vite.config.js` の `base` パスが正しく設定されている
- [ ] `App.jsx` で `HashRouter` を使用している
- [ ] GitHub Actions ワークフローが正しく設定されている
- [ ] GitHub Pages の設定が正しい

### デプロイ後
- [ ] GitHub Pages の URL でアクセスできる
- [ ] すべてのページが正常に表示される
- [ ] API 呼び出しが正常に動作する（バックエンドが利用可能な場合）
- [ ] モックデータが表示される（バックエンドが利用できない場合）

## まとめ

現在のデプロイメント構成は、開発・展示用途に最適化されています。フロントエンドは GitHub Pages で公開され、バックエンドはローカル Docker 環境で動作します。将来的には、本番環境へのデプロイメントを検討し、より堅牢なインフラ構成を実現します。

