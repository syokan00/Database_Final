# ER 図（Entity-Relationship Diagram）

## 概要

本ドキュメントでは、MemoLucky システムのデータベース設計を ER 図として説明します。主要なエンティティ（実体）とその関係を定義します。

## 主要エンティティ

### 1. users（ユーザー）

ユーザー情報を管理するテーブルです。

#### カラム定義
- `id` (INTEGER, PRIMARY KEY): ユーザー ID（自動採番）
- `email` (VARCHAR, UNIQUE, NOT NULL): メールアドレス（一意制約）
- `password_hash` (VARCHAR, NOT NULL): ハッシュ化されたパスワード（Argon2）
- `nickname` (VARCHAR): ニックネーム
- `major` (VARCHAR): 専攻
- `year` (INTEGER): 入学年
- `grade` (VARCHAR): 学年（大一、大二、大三、大四、M1、M2、D1 など）
- `language_preference` (VARCHAR, DEFAULT 'ja'): 言語設定
- `avatar_url` (VARCHAR): アバター画像の URL
- `cover_image_url` (VARCHAR): 背景画像の URL
- `bio` (TEXT): 自己紹介
- `role` (VARCHAR, DEFAULT 'user'): ロール（user/admin）
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()): アカウント作成日時

#### 制約
- `email` は一意である必要がある
- `password_hash` は Argon2 でハッシュ化される

### 2. posts（投稿・経験談）

ユーザーが作成する経験談投稿を管理するテーブルです。

#### カラム定義
- `id` (INTEGER, PRIMARY KEY): 投稿 ID（自動採番）
- `author_id` (INTEGER, FOREIGN KEY → users.id): 投稿者のユーザー ID
- `title` (TEXT, NOT NULL): 投稿タイトル
- `content` (TEXT, NOT NULL): 投稿内容（本文）
- `source_language` (VARCHAR, NOT NULL): 投稿言語（'ja'/'zh'/'en'）
- `category` (VARCHAR, DEFAULT 'other'): カテゴリ（lab/job/class/other）
- `tags` (TEXT): タグ（カンマ区切り）
- `restriction_type` (VARCHAR): 制限タイプ（例: 'no-kanji', 'emoji-only'）
- `image_urls` (TEXT): 画像 URL（カンマ区切り）
- `attachments` (JSON): 添付ファイル（JSON 配列形式）
- `is_anonymous` (BOOLEAN, DEFAULT FALSE): 匿名投稿フラグ
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()): 作成日時

#### 制約
- `author_id` は `users.id` への外部キー

### 3. items（出品アイテム）

ユーザーが出品する中古品を管理するテーブルです。

#### カラム定義
- `id` (INTEGER, PRIMARY KEY): アイテム ID（自動採番）
- `user_id` (INTEGER, FOREIGN KEY → users.id): 出品者のユーザー ID
- `title` (TEXT, NOT NULL): アイテム名
- `description` (TEXT): アイテム説明
- `price` (NUMERIC(10,2)): 価格
- `status` (VARCHAR, DEFAULT 'selling'): ステータス（selling/sold）
- `category` (VARCHAR, DEFAULT 'other'): カテゴリ
- `tags` (TEXT): タグ（カンマ区切り）
- `image_urls` (TEXT): 画像 URL（カンマ区切り）
- `contact_method` (TEXT): 連絡方法
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()): 作成日時

#### 制約
- `user_id` は `users.id` への外部キー

### 4. comments（コメント）

投稿へのコメントを管理するテーブルです。

#### カラム定義
- `id` (INTEGER, PRIMARY KEY): コメント ID（自動採番）
- `post_id` (INTEGER, FOREIGN KEY → posts.id): 投稿 ID
- `author_id` (INTEGER, FOREIGN KEY → users.id): コメント作成者のユーザー ID
- `content` (TEXT, NOT NULL): コメント内容
- `parent_id` (INTEGER, FOREIGN KEY → comments.id): 親コメント ID（返信の場合、NULL 可）
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()): 作成日時

#### 制約
- `post_id` は `posts.id` への外部キー
- `author_id` は `users.id` への外部キー
- `parent_id` は `comments.id` への外部キー（自己参照）

### 5. likes（いいね）

投稿への「いいね」を管理するテーブルです。

#### カラム定義
- `id` (INTEGER, PRIMARY KEY): いいね ID（自動採番）
- `post_id` (INTEGER, FOREIGN KEY → posts.id): 投稿 ID
- `user_id` (INTEGER, FOREIGN KEY → users.id): いいねを付けたユーザー ID
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()): いいね日時

#### 制約
- `post_id` は `posts.id` への外部キー
- `user_id` は `users.id` への外部キー

### 6. favorites（お気に入り）

投稿をお気に入りに追加した情報を管理するテーブルです。

#### カラム定義
- `id` (INTEGER, PRIMARY KEY): お気に入り ID（自動採番）
- `post_id` (INTEGER, FOREIGN KEY → posts.id): 投稿 ID
- `user_id` (INTEGER, FOREIGN KEY → users.id): お気に入りに追加したユーザー ID
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()): 追加日時

#### 制約
- `post_id` は `posts.id` への外部キー（CASCADE 削除）
- `user_id` は `users.id` への外部キー（CASCADE 削除）

### 7. follows（フォロー）

ユーザー間のフォロー関係を管理するテーブルです。

#### カラム定義
- `id` (INTEGER, PRIMARY KEY): フォロー ID（自動採番）
- `follower_id` (INTEGER, FOREIGN KEY → users.id, NOT NULL): フォローするユーザー ID
- `following_id` (INTEGER, FOREIGN KEY → users.id, NOT NULL): フォローされるユーザー ID
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()): フォロー開始日時

#### 制約
- `follower_id` は `users.id` への外部キー（CASCADE 削除）
- `following_id` は `users.id` への外部キー（CASCADE 削除）
- `(follower_id, following_id)` に UNIQUE 制約（重複フォロー防止）

### 8. notifications（通知）

ユーザーへの通知を管理するテーブルです。

#### カラム定義
- `id` (INTEGER, PRIMARY KEY): 通知 ID（自動採番）
- `user_id` (INTEGER, FOREIGN KEY → users.id, NOT NULL): 通知を受け取るユーザー ID
- `type` (VARCHAR, NOT NULL): 通知タイプ（'like', 'favorite', 'follow', 'comment', 'message'）
- `actor_id` (INTEGER, FOREIGN KEY → users.id): 通知を発生させたユーザー ID（NULL 可）
- `target_type` (VARCHAR): ターゲットタイプ（'post', 'user', 'item'）
- `target_id` (INTEGER): ターゲット ID（post_id, user_id, item_id）
- `read` (BOOLEAN, DEFAULT FALSE): 既読フラグ
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()): 通知作成日時

#### 制約
- `user_id` は `users.id` への外部キー（CASCADE 削除）
- `actor_id` は `users.id` への外部キー（SET NULL 削除）

### 9. badges（バッジ）

システムで使用可能なバッジのマスターテーブルです。

#### カラム定義
- `id` (INTEGER, PRIMARY KEY): バッジ ID（自動採番）
- `name` (VARCHAR, UNIQUE, NOT NULL): バッジ名（一意）
- `description` (TEXT): バッジ説明
- `icon` (VARCHAR): バッジアイコン（絵文字など）

#### バッジ一覧
- `first_post`: 初投稿
- `night_owl`: 深夜の秀才（0:00-6:00 に投稿）
- `streak_poster`: 継続の達人（5日連続投稿）
- `polyglot`: マルチリンガル（複数言語で投稿）
- `heart_collector`: 人気者（10いいね獲得）
- `comment_king`: コメント王（20コメント投稿）
- `helpful_friend`: 親切な友達（コメントが5回いいねされる）
- `smart_buyer`: 賢い買い手（3アイテム購入）
- `top_seller`: トップセラー（5アイテム販売）
- `treasure_hunter`: 宝物探し（レアアイテム発見）
- `lucky_clover`: ラッキークローバー（ランダムタスク完了）
- `heart_artist`: ハートアーティスト（いいねエフェクト10回使用）
- `brave_beginner`: 勇敢な初心者（初ログイン）
- `lost_scholar`: 迷える学者（全ページ訪問）

### 10. user_badges（ユーザーバッジ）

ユーザーが獲得したバッジの関連テーブルです。

#### カラム定義
- `user_id` (INTEGER, FOREIGN KEY → users.id, PRIMARY KEY): ユーザー ID
- `badge_id` (INTEGER, FOREIGN KEY → badges.id, PRIMARY KEY): バッジ ID
- `awarded_at` (TIMESTAMPTZ, DEFAULT NOW()): 獲得日時

#### 制約
- `(user_id, badge_id)` が複合主キー
- `user_id` は `users.id` への外部キー
- `badge_id` は `badges.id` への外部キー

### 11. item_messages（商品メッセージ）

商品に関する売り手と買い手のメッセージを管理するテーブルです。

#### カラム定義
- `id` (INTEGER, PRIMARY KEY): メッセージ ID（自動採番）
- `item_id` (INTEGER, FOREIGN KEY → items.id, NOT NULL): アイテム ID
- `sender_id` (INTEGER, FOREIGN KEY → users.id, NOT NULL): 送信者 ID
- `receiver_id` (INTEGER, FOREIGN KEY → users.id, NOT NULL): 受信者 ID
- `content` (TEXT, NOT NULL): メッセージ内容
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()): 送信日時

#### 制約
- `item_id` は `items.id` への外部キー（CASCADE 削除）
- `sender_id` は `users.id` への外部キー（CASCADE 削除）
- `receiver_id` は `users.id` への外部キー（CASCADE 削除）

---

## ER 図（テキスト表現）

```
┌─────────────────────────────────────────────────────────┐
│                        users                             │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                  │
│ email (UK)                                               │
│ password_hash                                            │
│ nickname                                                 │
│ major                                                    │
│ year                                                     │
│ grade                                                    │
│ language_preference                                      │
│ avatar_url                                               │
│ cover_image_url                                          │
│ bio                                                      │
│ role                                                     │
│ created_at                                               │
└─┬──────────┬──────────┬──────────┬──────────┬───────────┘
  │          │          │          │          │
  │ 1        │ 1        │ 1        │ 1        │ 1
  │          │          │          │          │
  │ N        │ N        │ N        │ N        │ N
  │          │          │          │          │
┌─▼───┐  ┌──▼─────┐ ┌──▼─────┐ ┌──▼─────┐ ┌─▼──────────┐
│posts│  │comments│ │ likes  │ │follows │ │item_messages│
├─────┤  ├────────┤ ├────────┤ ├────────┤ ├────────────┤
│id(PK)│  │id(PK)  │ │id(PK)  │ │id(PK)  │ │id(PK)      │
│author_id││post_id │ │post_id │ │follower_id│item_id    │
│title  ││author_id││user_id │ │following_id│sender_id  │
│content││content  ││created_at│created_at│receiver_id │
│...    ││parent_id│└────────┘ └────────┘ │content     │
│       ││created_at│                     │created_at  │
└───────┘└────────┘                     └────────────┘
  │
  │ 1
  │
  │ N
  │
┌─▼──────────┐
│favorites   │
├────────────┤
│id(PK)      │
│post_id(FK) │
│user_id(FK) │
│created_at  │
└────────────┘

┌─────────────────────────────────────────────────────────┐
│                        users                             │
└─┬───────────────────────────────────────────────────────┘
  │
  │ 1
  │
  │ N
  │
┌─▼────┐         ┌──────────────┐
│items │         │user_badges   │
├──────┤         ├──────────────┤
│id(PK)│         │user_id(PK,FK)│
│user_id│        │badge_id(PK,FK)│
│title  │        │awarded_at    │
│...    │        └──────┬───────┘
└───────┘               │
                        │ N
                        │
                        │ 1
                        │
                   ┌────▼─────┐
                   │ badges   │
                   ├──────────┤
                   │id(PK)    │
                   │name(UK)  │
                   │description│
                   │icon      │
                   └──────────┘

┌─────────────────────────────────────────────────────────┐
│                        users                             │
└─┬───────────────────────────────────────────────────────┘
  │
  │ 1 (user_id)
  │
  │ N
  │
┌─▼───────────┐
│notifications│
├─────────────┤
│id(PK)       │
│user_id(FK)  │
│type         │
│actor_id(FK) │
│target_type  │
│target_id    │
│read         │
│created_at   │
└─────────────┘
```

---

## リレーションシップ（関係）

### 1. users → posts（1 対 多）
- **関係**: 1 人のユーザーは複数の投稿を作成できる
- **外部キー**: `posts.author_id` → `users.id`

### 2. users → items（1 対 多）
- **関係**: 1 人のユーザーは複数のアイテムを出品できる
- **外部キー**: `items.user_id` → `users.id`

### 3. users → comments（1 対 多）
- **関係**: 1 人のユーザーは複数のコメントを作成できる
- **外部キー**: `comments.author_id` → `users.id`

### 4. users → likes（1 対 多）
- **関係**: 1 人のユーザーは複数のいいねを付けることができる
- **外部キー**: `likes.user_id` → `users.id`

### 5. users → favorites（1 対 多）
- **関係**: 1 人のユーザーは複数の投稿をお気に入りに追加できる
- **外部キー**: `favorites.user_id` → `users.id`
- **削除動作**: CASCADE

### 6. users → follows（多対多、自己参照）
- **関係**: ユーザーは複数のユーザーをフォローでき、複数のユーザーにフォローされる
- **外部キー**: `follows.follower_id` → `users.id`, `follows.following_id` → `users.id`
- **削除動作**: CASCADE

### 7. users → notifications（1 対 多）
- **関係**: 1 人のユーザーは複数の通知を受け取る
- **外部キー**: `notifications.user_id` → `users.id`, `notifications.actor_id` → `users.id`
- **削除動作**: CASCADE (user_id), SET NULL (actor_id)

### 8. users ↔ badges（多対多）
- **関係**: ユーザーは複数のバッジを獲得でき、バッジは複数のユーザーに付与される
- **関連テーブル**: `user_badges`
- **外部キー**: `user_badges.user_id` → `users.id`, `user_badges.badge_id` → `badges.id`

### 9. posts → comments（1 対 多）
- **関係**: 1 つの投稿には複数のコメントを付けることができる
- **外部キー**: `comments.post_id` → `posts.id`

### 10. posts → likes（1 対 多）
- **関係**: 1 つの投稿には複数のいいねを付けることができる
- **外部キー**: `likes.post_id` → `posts.id`

### 11. posts → favorites（1 対 多）
- **関係**: 1 つの投稿は複数のユーザーにお気に入りに追加される
- **外部キー**: `favorites.post_id` → `posts.id`
- **削除動作**: CASCADE

### 12. items → item_messages（1 対 多）
- **関係**: 1 つのアイテムには複数のメッセージが送られる
- **外部キー**: `item_messages.item_id` → `items.id`
- **削除動作**: CASCADE

### 13. comments → comments（自己参照、階層構造）
- **関係**: コメントは返信を持つことができる（親子関係）
- **外部キー**: `comments.parent_id` → `comments.id`

---

## インデックス

### users テーブル
- `email` に UNIQUE インデックス（既に UNIQUE 制約により自動生成）

### posts テーブル
- `id` に主キーインデックス（自動生成）
- `author_id` に外部キーインデックス（自動生成）

### follows テーブル
- `(follower_id, following_id)` に UNIQUE インデックス（重複フォロー防止）

---

## データ整合性

### 制約
- **主キー制約**: 各テーブルの `id` は一意で非 NULL
- **外部キー制約**: 参照整合性を保証
- **一意制約**: `email`、フォローなどの重複防止

### トランザクション
- 複数のテーブルにまたがる操作（例: 投稿作成、バッジ付与）はトランザクション内で実行
- ACID 特性（原子性、一貫性、独立性、永続性）を保証

---

## 匿名投稿の処理

### posts.is_anonymous = TRUE の場合
- `author_id` は保持される（削除権限のため）
- 表示時は `author` 情報が `None` として返される
- 投稿者本人のみが自分の匿名投稿を削除できる
