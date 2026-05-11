# データベース接続エラー トラブルシューティング

## エラー: `Tenant or user not found`

このエラーは、Supabase データベースへの接続が失敗したことを示しています。

### 原因

1. **データベース接続文字列が無効**
   - ユーザー名やパスワードが変更された
   - データベースが削除または移行された
   - 接続文字列の形式が間違っている

2. **ネットワーク問題**
   - Supabase サービスが一時的に利用できない
   - ファイアウォールやネットワーク設定の問題

## 解決方法

### 方法 1: 正しい接続文字列を取得（推奨）

プロジェクトメンテナーに連絡して、最新の有効な接続文字列を取得してください。

または、Supabase プロジェクトの所有者であれば：

1. Supabase Dashboard にログイン
2. プロジェクトを選択
3. **Settings** → **Database** に移動
4. **Connection string** セクションで接続文字列を確認
5. **Connection pooling** の接続文字列を使用（推奨）

### 方法 2: ローカルデータベースを使用（開発環境）

Render ではローカルデータベースは使用できませんが、**ローカル開発環境**では使用できます。

#### ローカル開発環境での設定

1. `.env` ファイルを作成または編集：
   ```env
   DATABASE_URL=postgresql://postgres:changeme@db:5432/memoluck
   ```

2. Docker Compose でローカルデータベースを起動：
   ```bash
   docker-compose up -d db
   ```

3. データベースを初期化：
   ```bash
   # データベースコンテナ内で init.sql を実行
   docker-compose exec db psql -U postgres -d memoluck -f /docker-entrypoint-initdb.d/init.sql
   ```

### 方法 3: Render で PostgreSQL サービスを使用（本番環境）

Render で PostgreSQL データベースを作成する方法：

1. Render Dashboard → **New +** → **PostgreSQL**
2. データベースを作成
3. 接続文字列を取得
4. Web Service の環境変数に設定：
   ```
   DATABASE_URL=postgres://user:password@host:port/dbname
   ```

### 方法 4: 一時的な回避策（テスト用）

データベース接続エラーを一時的に回避するには、環境変数を削除またはコメントアウトして、エラーメッセージを確認できます：

```python
# backend/app/database.py で一時的に
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:changeme@localhost:5432/memoluck")
```

⚠️ **注意**: これは開発環境でのみ使用してください。

## 接続文字列の形式

PostgreSQL 接続文字列の正しい形式：

```
postgresql://[ユーザー名]:[パスワード]@[ホスト]:[ポート]/[データベース名]
```

例：
```
postgresql://readonly_demo:demo_readonly_2025@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

### 接続文字列の各部分

- **ユーザー名**: `readonly_demo`
- **パスワード**: `demo_readonly_2025`
- **ホスト**: `aws-1-ap-south-1.pooler.supabase.com`
- **ポート**: `6543` (Connection Pooling) または `5432` (直接接続)
- **データベース名**: `postgres`

## よくある問題

### Q1: 接続文字列はどこで確認できますか？

**A**: 
- Supabase Dashboard → Settings → Database → Connection string
- プロジェクトメンテナーに問い合わせ

### Q2: 読み取り専用データベースで書き込み操作を試みるとどうなりますか？

**A**: エラーが発生します。読み取り専用データベースでは、ユーザー登録や投稿などの書き込み操作はできません。

### Q3: Render でローカルデータベースを使用できますか？

**A**: いいえ。Render はクラウドサービスなので、ローカルの Docker コンテナにアクセスできません。クラウドデータベース（Supabase または Render PostgreSQL）を使用する必要があります。

### Q4: 接続文字列に特殊文字が含まれている場合は？

**A**: URL エンコードが必要です。例：
- `@` → `%40`
- `#` → `%23`
- ` ` (スペース) → `%20`

## 次のステップ

1. **プロジェクトメンテナーに連絡**して、最新の有効な接続文字列を取得
2. **Render の環境変数を更新**
3. **サービスを再デプロイ**
4. **接続をテスト**

## 緊急時の対応

データベース接続ができない場合でも、フロントエンドは表示できます（モックデータを使用）。ただし、以下の機能は動作しません：

- ユーザー登録・ログイン
- 投稿の作成・編集
- データの保存

これらの機能を使用するには、有効なデータベース接続が必要です。

