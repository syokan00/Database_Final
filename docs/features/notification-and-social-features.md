# 通知・ソーシャル機能の実装

## 更新日
2024年12月

## 概要
MemoLucky プラットフォームに通知システム、フォロー機能、商品チャット機能、ユーザープロフィール閲覧機能を追加しました。これにより、ユーザー間のコミュニケーションとエンゲージメントが大幅に向上しました。

## 実装された機能

### 1. 通知システム

#### 1.1 通知の種類
- **いいね通知**: ユーザーが投稿にいいねをした際に、投稿者に通知
- **お気に入り通知**: ユーザーが投稿をお気に入りに追加した際に、投稿者に通知
- **フォロー通知**: ユーザーが他のユーザーをフォローした際に、フォローされたユーザーに通知
- **コメント通知**: ユーザーが投稿にコメントした際に、投稿者に通知
- **メッセージ通知**: 商品に関するメッセージが届いた際に、受信者に通知

#### 1.2 通知の特徴
- **新規登録ユーザー**: 新規登録時には通知は表示されません（空の状態）
- **リアルタイム更新**: 30秒ごとに通知を自動更新
- **既読管理**: 個別に既読マーク、または一括で既読にする機能
- **通知カウント**: 未読通知数をバッジで表示
- **通知クリック**: 通知タイプに応じて適切なページへ自動遷移

#### 1.3 技術実装
- **バックエンド**: `Notification` モデル、通知作成API、既読管理API
- **フロントエンド**: 通知ドロップダウン、通知リスト表示、既読管理UI

### 2. フォロー機能

#### 2.1 フォロー機能の特徴
- **フォロー/フォロー解除**: ワンクリックでフォロー状態を切り替え
- **フォロワー/フォロー中リスト**: ユーザーのフォロワーとフォロー中のユーザーを一覧表示
- **プロフィール統合**: プロフィールページにフォロワー数とフォロー中数を表示
- **相互フォロー表示**: フォロー状態を視覚的に表示

#### 2.2 技術実装
- **バックエンド**: `Follow` モデル、フォロー/フォロー解除API、フォロワー/フォロー中リスト取得API
- **フロントエンド**: `FollowListPage`、プロフィールページのフォロー統計表示

### 3. 商品チャット機能

#### 3.1 チャット機能の特徴
- **商品別チャット**: 各商品に対して独立したチャットルーム
- **売り手・買い手対応**: 売り手と買い手の両方の視点に対応
- **通知連携**: メッセージ受信時に通知を自動生成
- **リアルタイム表示**: メッセージの送受信を即座に反映

#### 3.2 技術実装
- **バックエンド**: `ItemMessage` モデル、メッセージ送信API、メッセージ取得API、会話リストAPI
- **フロントエンド**: `ChatPage`、商品ページからのチャット開始、通知からのチャット開始

### 4. ユーザープロフィール閲覧機能

#### 4.1 プロフィール閲覧の特徴
- **他ユーザープロフィール**: 他のユーザーのプロフィールを閲覧可能
- **プロフィール比較**: 自分のプロフィールと他ユーザーのプロフィールを区別表示
- **フォロー統合**: プロフィールページから直接フォロー/フォロー解除
- **投稿・アイテム表示**: 他ユーザーの投稿とアイテムを閲覧可能
- **ナビゲーション**: チャット、通知、フォローリストからプロフィールへ遷移

#### 4.2 技術実装
- **バックエンド**: ユーザー統計API、ユーザー情報取得API
- **フロントエンド**: `ProfilePage` の拡張、URL パラメータによるユーザー識別

### 5. UI/UX の改善

#### 5.1 メニュー改善
- **React Portal 使用**: 三つ点メニューを `document.body` にレンダリングし、z-index と overflow の問題を解決
- **位置自動調整**: メニューの位置を自動計算し、画面外にはみ出さないように調整
- **イベント処理最適化**: クリックイベントの競合を解決し、メニューの安定性を向上

#### 5.2 フォーム改善
- **アクセシビリティ**: すべてのフォームフィールドに `id` と `name` 属性を追加
- **ラベル関連付け**: `htmlFor` 属性を使用してラベルと入力フィールドを関連付け

#### 5.3 Service Worker 改善
- **エラーハンドリング**: サポートされていないプロトコル（chrome-extension など）のリクエストをスキップ
- **外部リソース**: 外部リソースのキャッシュをスキップ
- **エラー応答**: 常に有効な `Response` オブジェクトを返すように改善

## データベーススキーマ

### Notification モデル
```python
- id: Integer (Primary Key)
- user_id: Integer (Foreign Key to users.id)
- type: String ('like', 'favorite', 'follow', 'comment', 'message')
- actor_id: Integer (Foreign Key to users.id, nullable)
- target_type: String ('post', 'user', 'item', nullable)
- target_id: Integer (nullable)
- read: Boolean (default: False)
- created_at: DateTime
```

### ItemMessage モデル
```python
- id: Integer (Primary Key)
- item_id: Integer (Foreign Key to items.id)
- sender_id: Integer (Foreign Key to users.id)
- receiver_id: Integer (Foreign Key to users.id)
- content: Text
- read: Boolean (default: False)
- created_at: DateTime
```

### Follow モデル（既存）
```python
- follower_id: Integer (Foreign Key to users.id)
- following_id: Integer (Foreign Key to users.id)
- created_at: DateTime
```

## API エンドポイント

### 通知関連
- `GET /notifications/` - 通知リスト取得
- `GET /notifications/unread/count` - 未読通知数取得
- `PUT /notifications/{id}/read` - 通知を既読にする
- `PUT /notifications/read-all` - すべての通知を既読にする

### フォロー関連
- `POST /users/{user_id}/follow` - ユーザーをフォロー
- `DELETE /users/{user_id}/follow` - フォロー解除
- `GET /users/{user_id}/followers` - フォロワーリスト取得
- `GET /users/{user_id}/following` - フォロー中リスト取得
- `GET /users/me/following` - 現在のユーザーのフォロー中IDリスト取得

### メッセージ関連
- `POST /messages/items/{item_id}` - 商品メッセージ送信
- `GET /messages/items/{item_id}` - 商品メッセージ取得
- `GET /messages/items` - 商品会話リスト取得

### ユーザー関連
- `GET /users/{user_id}/stats` - ユーザー統計取得（フォロワー数、フォロー中数など）

## フロントエンドコンポーネント

### 新規コンポーネント
- `FollowListPage` - フォロワー/フォロー中リスト表示ページ
- `ItemMoreMenu` - 商品カードの三つ点メニュー（改善版）

### 更新されたコンポーネント
- `Navbar` - 通知ドロップダウン、通知カウント表示
- `ProfilePage` - 他ユーザープロフィール閲覧、フォロー機能統合
- `ChatPage` - 商品チャット機能
- `ItemMoreMenu` - React Portal 使用、位置自動調整

## 国際化（i18n）

### 追加された翻訳キー

#### notifications
- `title`, `noNotifications`, `markAllAsRead`
- `notificationLike`, `notificationFavorite`, `notificationFollow`
- `notificationComment`, `notificationMessage`, `notificationItemMessage`
- `loading`, `loadFailed`

#### follow
- `followers`, `following`, `noFollowers`, `noFollowing`
- `loading`, `loadFailed`, `followUser`, `unfollowUser`

#### chat
- `title`, `noChats`, `sendMessage`, `typeMessage`
- `messageSent`, `messageFailed`, `contactSeller`, `contactBuyer`
- `itemChat`, `pleaseLogin`, `loginToMessage`, `selectBuyer`
- `receiverUnknown`, `online`, `selectChat`

#### profile
- `followers`, `following`, `followUser`, `unfollowUser`
- `viewUserProfile`, `loadingProfile`, `profileError`
- `backToMyProfile`, `thisTabOnlyForMe`

#### common
- `unfollow`, `moreOptions`

## バグ修正

### 1. 通知システム
- **問題**: 新規登録ユーザーが不要な通知を受信
- **解決**: 新規登録時には通知を表示せず、実際のアクションに基づいて通知を生成

### 2. 商品チャット
- **問題**: 売り手が買い手のメッセージを確認できない
- **解決**: バックエンドで自動的に買い手を特定し、メッセージを表示

### 3. プロフィール閲覧
- **問題**: 他ユーザーのプロフィールが空白で表示される
- **解決**: ローディング状態とエラーハンドリングを追加

### 4. メニューUI
- **問題**: 三つ点メニューが点滅し、クリックしにくい
- **解決**: React Portal を使用し、イベント処理を最適化

### 5. Service Worker
- **問題**: サポートされていないプロトコルのリクエストでエラー
- **解決**: プロトコルチェックとエラーハンドリングを追加

## 今後の改善点

### 機能拡張
1. **リアルタイム通知**: WebSocket を使用したリアルタイム通知配信
2. **通知設定**: ユーザーが通知の種類をカスタマイズ可能に
3. **グループチャット**: 複数ユーザーでのチャット機能
4. **メッセージ検索**: チャット内のメッセージ検索機能
5. **通知履歴**: 通知の履歴管理とフィルタリング

### パフォーマンス改善
1. **通知のページネーション**: 大量の通知を効率的に表示
2. **メッセージの遅延読み込み**: 長い会話の効率的な表示
3. **キャッシュ最適化**: 通知とメッセージのキャッシュ戦略

### UX 改善
1. **通知の音声/振動**: モバイルデバイスでの通知体験向上
2. **メッセージの既読表示**: メッセージの既読状態を表示
3. **タイピングインジケーター**: 相手が入力中であることを表示

## テスト項目

### 通知システム
- [ ] 新規登録ユーザーに通知が表示されない
- [ ] いいね、お気に入り、フォロー、コメント、メッセージで通知が生成される
- [ ] 通知をクリックして適切なページに遷移する
- [ ] 通知を既読にする機能が動作する
- [ ] すべての通知を既読にする機能が動作する

### フォロー機能
- [ ] フォロー/フォロー解除が正常に動作する
- [ ] フォロワー/フォロー中リストが正しく表示される
- [ ] プロフィールページの統計が正しく表示される

### 商品チャット
- [ ] 売り手と買い手の両方でメッセージを送受信できる
- [ ] 通知からチャットページに遷移できる

### プロフィール閲覧
- [ ] 他ユーザーのプロフィールを閲覧できる
- [ ] プロフィールページからフォロー/フォロー解除できる
- [ ] 他ユーザーの投稿とアイテムを閲覧できる

## 関連ドキュメント
- [アプリケーション概要](../PM/app-overview.md)
- [プロジェクト報告書](../PM/project-report.md)
- [システムアーキテクチャ](../Architect/system-architecture.md)

