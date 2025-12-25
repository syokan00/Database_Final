# GitHub リポジトリ問題チェックリスト

## 確認済み項目

### ✅ セキュリティ
- [x] `.env` ファイルが `.gitignore` に含まれている
- [x] 機密情報（パスワード、API キー）がコミットされていない
- [x] 証明書やキーファイルが `.gitignore` に含まれている
- [x] `docs.zip` などの一時ファイルが `.gitignore` に追加済み

### ✅ 設定ファイル
- [x] `.gitignore` が適切に設定されている
- [x] GitHub Actions ワークフローが正しく設定されている
- [x] 重複するワークフローファイルが削除されている

### ✅ コード品質
- [x] デバッグ用の `console.log` は開発環境のみで実行される
- [x] コードフォーマットが統一されている

### ✅ コミットメッセージ
- [x] コミットメッセージは日本語または英語で記述されている
- [x] コミットメッセージの形式が統一されている（feat:, fix: など）

## 潜在的な問題

### ⚠️ 注意が必要な項目

1. **docs.zip ファイル**
   - 現在リポジトリに含まれている可能性がある
   - `.gitignore` に `*.zip` を追加済み
   - 既存の `docs.zip` を削除する必要がある場合：
     ```bash
     git rm --cached docs.zip
     git commit -m "chore: remove docs.zip from repository"
     ```

2. **GitHub Pages デプロイメント**
   - ワークフローが正しく動作しているか確認
   - Settings → Pages で Source が "GitHub Actions" に設定されているか確認

3. **環境変数**
   - `VITE_API_URL` が GitHub Actions Variables に設定されているか確認
   - バックエンドの環境変数が適切に管理されているか確認

4. **大容量ファイル**
   - `node_modules/` や `dist/` が `.gitignore` に含まれているか確認済み
   - 画像や動画ファイルのサイズを確認

## 推奨される改善

### 1. コミットメッセージの規約
現在のコミットメッセージは適切ですが、以下の規約を推奨：

- `feat:` - 新機能
- `fix:` - バグ修正
- `docs:` - ドキュメントのみの変更
- `style:` - コードの動作に影響しない変更（フォーマットなど）
- `refactor:` - バグ修正や機能追加を伴わないコード変更
- `chore:` - ビルドプロセスや補助ツールの変更

### 2. ブランチ保護ルール
GitHub リポジトリの Settings → Branches で以下を設定することを推奨：

- main ブランチへの直接プッシュを制限
- Pull Request のレビューを必須化
- ステータスチェックを必須化

### 3. 依存関係のセキュリティ
定期的に以下を確認：

```bash
# フロントエンド
cd frontend
npm audit

# バックエンド
cd backend
pip check
```

### 4. コードレビュー
重要な変更は Pull Request を通じてレビューすることを推奨

## チェックコマンド

### リポジトリの状態確認
```bash
# 未追跡ファイルの確認
git status

# 大容量ファイルの確認
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '/^blob/ {print substr($0,6)}' | sort --numeric-sort --key=2 | tail -10

# 機密情報の検索（注意：実際の機密情報は含めない）
git log --all --full-history --source -S "password" -- "*.py" "*.js" "*.jsx"
```

### コミット履歴の確認
```bash
# 最近のコミットを確認
git log --oneline -20

# コミットメッセージの言語を確認
git log --format=%s -20
```

## 定期的なメンテナンス

### 月次チェック
- [ ] 依存関係の更新
- [ ] セキュリティアドバイザリの確認
- [ ] 未使用ファイルの削除
- [ ] ドキュメントの更新

### リリース前チェック
- [ ] すべてのテストが通過している
- [ ] ドキュメントが最新である
- [ ] 変更ログが更新されている
- [ ] セキュリティチェックが完了している

