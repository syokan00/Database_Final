# Render デプロイメント クイックガイド

## 📋 Render での設定値（コピー用）

### 基本設定

- **Service Type**: Web Service
- **Name**: `memolucky-backend`
- **Region**: Singapore（または最寄りのリージョン）
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **重要**

### ビルドと起動コマンド

**Build Command:**
```bash
pip install -r requirements.txt
```

**Start Command:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Pre-Deploy Command:**
（空欄のまま）

**Docker Command:**
（空欄のまま）

### 環境変数

Render Dashboard の **Environment** セクションで以下を追加：

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://readonly_demo:demo_readonly_2025@aws-1-ap-south-1.pooler.supabase.com:6543/postgres` | Supabase データベース ⚠️ **注意：この接続文字列が無効な場合は、プロジェクトメンテナーに問い合わせるか、ローカルデータベースを使用してください** |
| `JWT_SECRET` | `your-strong-random-secret-key-change-this` | JWT 認証キー（**必ず変更**） |
| `ENVIRONMENT` | `production` | 環境識別（オプション） |

#### オプション環境変数（必要に応じて）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `REDIS_URL` | `redis://your-redis-url:6379/0` | Redis 接続（Render Redis サービス使用時） |
| `MINIO_ENDPOINT` | `localhost:9000` | MinIO エンドポイント |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO アクセスキー |
| `MINIO_SECRET_KEY` | `changeme` | MinIO シークレットキー |
| `MINIO_BUCKET` | `memoluck-files` | MinIO バケット名 |

## 🔑 JWT_SECRET の生成方法

強力なランダム文字列を生成する方法：

### 方法 1: Python で生成
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 方法 2: OpenSSL で生成
```bash
openssl rand -base64 32
```

### 方法 3: オンラインツール
- https://randomkeygen.com/ などのツールを使用

生成した文字列を `JWT_SECRET` の値として設定してください。

## ✅ デプロイ後の確認

1. **健康チェック**
   ```
   https://your-service-name.onrender.com/health
   ```
   期待される応答: `{"status": "ok"}`

2. **API ルート**
   ```
   https://your-service-name.onrender.com/
   ```
   期待される応答: `{"message": "Welcome to Memolucky API"}`

3. **API ドキュメント**
   ```
   https://your-service-name.onrender.com/docs
   ```
   FastAPI の自動生成ドキュメントが表示されます

## 🔗 フロントエンド接続

バックエンドがデプロイされたら：

1. GitHub リポジトリ → **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. 新しい変数を追加：
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-service-name.onrender.com/api`
3. フロントエンドを再デプロイ：
   ```bash
   git push origin main
   ```

## 🐛 よくある問題

### ビルドエラー: `requirements.txt not found`
- **原因**: Root Directory が `backend` に設定されていない
- **解決**: Root Directory を `backend` に設定

### 起動エラー: `ModuleNotFoundError: No module named 'app'`
- **原因**: Start Command のパスが間違っている
- **解決**: Start Command を `uvicorn app.main:app --host 0.0.0.0 --port $PORT` に設定

### CORS エラー
- **原因**: フロントエンドの URL が CORS 設定に含まれていない
- **解決**: `backend/app/main.py` の CORS 設定を確認（既に設定済み）

### データベース接続エラー: `Tenant or user not found`
- **原因**: Supabase データベースの接続文字列が無効または期限切れ
- **解決方法**:
  1. プロジェクトメンテナーに連絡して、最新の有効な接続文字列を取得
  2. または、Render で PostgreSQL サービスを作成して使用
  3. 詳細は `docs/Infra/database-connection-troubleshooting.md` を参照

## 📝 チェックリスト

デプロイ前：
- [ ] Render アカウントが作成されている
- [ ] GitHub リポジトリが接続されている
- [ ] Root Directory が `backend` に設定されている
- [ ] Build Command と Start Command が正しく設定されている
- [ ] 環境変数がすべて設定されている
- [ ] `JWT_SECRET` が強力なランダム文字列に変更されている

デプロイ後：
- [ ] デプロイが成功している（Render Dashboard で確認）
- [ ] `/health` エンドポイントが応答する
- [ ] `/` エンドポイントが応答する
- [ ] GitHub で `VITE_API_URL` 変数が設定されている
- [ ] フロントエンドが再デプロイされている
- [ ] フロントエンドからバックエンドへの接続が正常に動作する

## 🎯 最終的な URL

- **フロントエンド**: https://syokan00.github.io/Database_Final/
- **バックエンド**: https://your-service-name.onrender.com
- **API エンドポイント**: https://your-service-name.onrender.com/api

これで、誰でも専用リンクからアプリケーションにアクセスできます！

