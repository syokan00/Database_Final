# セットアップガイド - ローカル環境での実行方法

## ⚠️ 重要：ログインに失敗する場合

GitHub からダウンロードしたファイルで **"Registration failed"** または **"ログインに失敗しました"** というエラーが表示される場合、**バックエンドサービスが起動していない**可能性が高いです。

### 最も一般的な原因

1. **Docker サービスが起動していない** ⚠️ 最も重要
2. **バックエンド API に接続できない**（`http://localhost:8001/api` にアクセスできない）
3. **データベースが初期化されていない**
4. **環境変数が設定されていない**

## 完全なセットアップ手順

### 前提条件

- **Docker Desktop** がインストールされ、起動していること
- **Node.js 18以上** がインストールされていること
- **Git** がインストールされていること

### ステップ 1: リポジトリのクローンまたはダウンロード

```bash
git clone https://github.com/syokan00/Database_Final.git
cd Database_Final
```

または、ZIP ファイルをダウンロードして解凍した場合：

```bash
cd Database_Final
```

### ステップ 2: バックエンドの環境変数設定（オプション）

**重要**: Docker Compose を使用する場合、`.env` ファイルは**作成する必要がありません**。Docker Compose が自動的に環境変数を設定します。

もし手動で設定したい場合のみ：

**Windows (PowerShell または CMD)**:
```bash
cd backend
copy env.example .env
```

**Linux/Mac**:
```bash
cd backend
cp env.example .env
```

**注意**: Docker Compose を使用する場合は、このステップをスキップして次のステップに進んでください。

### ステップ 3: Docker Compose でサービスを起動 ⚠️ 必須

**重要**: 
- Docker Desktop が**起動している**ことを確認してください
- プロジェクトの**ルートディレクトリ**で実行してください

**Windows (PowerShell または CMD)**:
```bash
# プロジェクトルートに戻る（backend ディレクトリにいる場合）
cd ..

# Docker Compose でサービスを起動（これがないとログインできません！）
docker-compose up -d

# 起動を確認（すべてのコンテナが "Up" と表示されることを確認）
docker-compose ps
```

**⚠️ 注意**: 
- バックエンドサービスが起動していないと、フロントエンドからログイン・登録できません
- 初回起動時は、イメージのダウンロードとビルドに数分かかる場合があります
- すべてのコンテナが "Up" になるまで待ってください（約 30-60 秒）

これにより、以下のサービスが起動します：
- **PostgreSQL** (ポート 5433)
- **Redis** (ポート 6380)
- **MinIO** (ポート 9002, 9003)
- **LibreTranslate** (ポート 5000)
- **FastAPI バックエンド** (ポート 8001)
- **Celery** (バックグラウンドタスク)

### ステップ 4: サービスの起動確認

```bash
# すべてのコンテナが起動しているか確認
docker-compose ps

# バックエンドのログを確認
docker-compose logs backend

# データベースの接続を確認
docker-compose exec db psql -U postgres -d memoluck -c "SELECT version();"
```

### ステップ 5: フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

フロントエンドは `http://localhost:5173` で起動します。

### ステップ 6: バックエンド API の確認

ブラウザで以下にアクセスして、バックエンドが正常に動作しているか確認：

```
http://localhost:8001/api/docs
```

FastAPI の自動生成ドキュメントが表示されれば、バックエンドは正常に動作しています。

## トラブルシューティング

### 問題 1: "Registration failed" または "ログインに失敗しました" ⚠️ 最も重要

**原因**: **バックエンドサービスが起動していない**（99% のケース）

**解決方法（順番に試してください）**:

#### 1. Docker Desktop が起動しているか確認
- Windows: タスクバーに Docker アイコンがあるか確認
- Docker Desktop を起動してください

#### 2. コンテナが起動しているか確認
```bash
docker-compose ps
```
すべてのコンテナが "Up" と表示されない場合、以下を実行：

```bash
# コンテナを停止
docker-compose down

# コンテナを起動
docker-compose up -d

# 再度確認
docker-compose ps
```

#### 3. バックエンド API が応答するか確認
ブラウザで以下にアクセス：
```
http://localhost:8001/api/docs
```

**✅ 成功**: FastAPI のドキュメントページが表示される
**❌ 失敗**: ページが表示されない、またはエラーが表示される

#### 4. バックエンドのログを確認
```bash
docker-compose logs backend
```
エラーメッセージを確認してください。よくあるエラー：
- `JWT_SECRET environment variable is required` → `.env` ファイルが必要
- `Connection refused` → データベースが起動していない
- `Port already in use` → ポートが使用されている

#### 5. フロントエンドの API URL を確認
`frontend/src/api/client.js` で、デフォルトの API URL が `http://localhost:8001/api` になっているか確認してください。

#### 6. ブラウザのコンソールでエラーを確認
1. フロントエンドページで F12 を押す
2. Console タブを開く
3. Network タブを開く
4. ログインを試みる
5. エラーメッセージを確認：
   - `Network Error` → バックエンドに接続できない
   - `CORS error` → CORS 設定の問題
   - `404 Not Found` → API エンドポイントが間違っている

### 問題 2: データベース接続エラー

**解決方法**:

```bash
# データベースコンテナを再起動
docker-compose restart db

# データベースの初期化を確認
docker-compose exec db psql -U postgres -d memoluck -c "\dt"
```

### 問題 3: ポートが既に使用されている

**解決方法**:

`docker-compose.yml` でポートを変更するか、使用しているプロセスを終了してください。

```bash
# Windows でポート 8001 を使用しているプロセスを確認
netstat -ano | findstr :8001

# プロセスを終了（PID を確認してから）
taskkill /PID <PID> /F
```

### 問題 4: フロントエンドがバックエンドに接続できない

**解決方法**:

1. **CORS 設定を確認**
   `backend/app/main.py` で CORS が正しく設定されているか確認してください。

2. **環境変数を確認**
   `frontend/.env` ファイルを作成（存在しない場合）：
   ```env
   VITE_API_URL=http://localhost:8001/api
   ```

3. **ブラウザのコンソールを確認**
   F12 を押して開発者ツールを開き、Network タブで API リクエストが失敗していないか確認してください。

## 初回ユーザー登録

1. フロントエンドにアクセス: `http://localhost:5173`
2. 「新規登録」をクリック
3. メールアドレスとパスワードを入力
4. 登録後、自動的にログインされます

## よくある質問

### Q: なぜ Docker が必要なのですか？

A: このアプリケーションは複数のサービス（PostgreSQL、Redis、MinIO など）に依存しているため、Docker Compose を使用してすべてのサービスを簡単に起動できます。

### Q: Docker を使わずに実行できますか？

A: 可能ですが、各サービスを個別にインストールして設定する必要があります。推奨されません。

### Q: ポート番号を変更できますか？

A: はい、`docker-compose.yml` でポートマッピングを変更できます。ただし、フロントエンドの `VITE_API_URL` も合わせて変更する必要があります。

## 次のステップ

セットアップが完了したら：

1. ユーザーを登録
2. 投稿を作成
3. 機能をテスト

問題が解決しない場合は、GitHub の Issues で質問してください。

