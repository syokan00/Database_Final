# ER 図（Entity-Relationship Diagram）

## 概要

本ドキュメントでは、システムのデータベース設計を ER 図として説明します。主要なエンティティ（実体）とその関係を定義します。

## 主要エンティティ

### 1. users（ユーザー）

ユーザー情報を管理するテーブルです。

#### カラム定義
- `id` (SERIAL, PRIMARY KEY): ユーザー ID（自動採番）
- `username` (VARCHAR(80), UNIQUE, NOT NULL): ユーザー名（一意制約）
- `email` (VARCHAR(255), UNIQUE, NOT NULL): メールアドレス（一意制約）
- `hashed_password` (VARCHAR(255), NOT NULL): ハッシュ化されたパスワード
- `created_at` (TIMESTAMP, DEFAULT NOW()): アカウント作成日時
- `updated_at` (TIMESTAMP, DEFAULT NOW()): 最終更新日時
- `is_active` (BOOLEAN, DEFAULT TRUE): アカウント有効フラグ
- `avatar_url` (VARCHAR(500)): アバター画像の URL（オプション）

#### 制約
- `username` と `email` は一意である必要がある
- `hashed_password` は Argon2 でハッシュ化される

### 2. posts（投稿）

ユーザーが作成するメモ・タスク投稿を管理するテーブルです。

#### カラム定義
- `id` (SERIAL, PRIMARY KEY): 投稿 ID（自動採番）
- `user_id` (INTEGER, FOREIGN KEY → users.id): 投稿者のユーザー ID
- `title` (VARCHAR(255), NOT NULL): 投稿タイトル
- `content` (TEXT): 投稿内容（本文）
- `created_at` (TIMESTAMP, DEFAULT NOW()): 作成日時
- `updated_at` (TIMESTAMP, DEFAULT NOW()): 最終更新日時
- `is_pinned` (BOOLEAN, DEFAULT FALSE): ピン留めフラグ
- `tags` (JSONB): タグ（配列形式、オプション）

#### 制約
- `user_id` は `users.id` への外部キー
- `user_id` が削除されると、関連する投稿も削除される（CASCADE）

### 3. items（出品アイテム）

ユーザーが出品するアイテム（中古品など）を管理するテーブルです。

#### カラム定義
- `id` (SERIAL, PRIMARY KEY): アイテム ID（自動採番）
- `user_id` (INTEGER, FOREIGN KEY → users.id): 出品者のユーザー ID
- `title` (VARCHAR(255), NOT NULL): アイテム名
- `description` (TEXT): アイテム説明
- `price` (DECIMAL(10, 2)): 価格（オプション）
- `status` (VARCHAR(50), DEFAULT 'available'): ステータス（available, sold, reserved など）
- `category` (VARCHAR(100)): カテゴリ（オプション）
- `tags` (JSONB): タグ（配列形式、オプション）
- `image_urls` (TEXT): 画像 URL（カンマ区切り、オプション）
- `contact_method` (VARCHAR(100)): 連絡方法（オプション）
- `created_at` (TIMESTAMP, DEFAULT NOW()): 作成日時
- `updated_at` (TIMESTAMP, DEFAULT NOW()): 最終更新日時

#### 制約
- `user_id` は `users.id` への外部キー
- `user_id` が削除されると、関連するアイテムも削除される（CASCADE）
- `price` は 0 以上である必要がある（アプリケーションレベルで検証）

### 4. likes（いいね）

投稿やアイテムへの「いいね」を管理するテーブルです。

#### カラム定義
- `id` (SERIAL, PRIMARY KEY): いいね ID（自動採番）
- `user_id` (INTEGER, FOREIGN KEY → users.id): いいねを付けたユーザー ID
- `post_id` (INTEGER, FOREIGN KEY → posts.id, NULL): 投稿 ID（投稿へのいいねの場合）
- `item_id` (INTEGER, FOREIGN KEY → items.id, NULL): アイテム ID（アイテムへのいいねの場合）
- `created_at` (TIMESTAMP, DEFAULT NOW()): いいね日時

#### 制約
- `user_id` は `users.id` への外部キー
- `post_id` は `posts.id` への外部キー（NULL 可）
- `item_id` は `items.id` への外部キー（NULL 可）
- `post_id` と `item_id` のどちらか一方は必須
- 同じユーザーが同じ投稿/アイテムに複数回いいねを付けることはできない（UNIQUE 制約）

## ER 図（テキスト表現）

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ username (UK)   │
│ email (UK)      │
│ hashed_password │
│ created_at      │
│ updated_at      │
│ is_active       │
│ avatar_url      │
└────────┬────────┘
         │
         │ 1
         │
         │ N
         │
    ┌────┴────┐
    │         │
    │         │
┌───▼───┐ ┌──▼────┐
│ posts │ │ items │
├───────┤ ├───────┤
│ id(PK)│ │ id(PK)│
│user_id│ │user_id│
│ title │ │ title │
│content│ │descrip│
│tags   │ │ price │
│...    │ │status │
└───┬───┘ │tags   │
    │     │...    │
    │     └───┬───┘
    │         │
    │ N       │ N
    │         │
    │         │
┌───▼─────────▼───┐
│     likes       │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ post_id (FK)    │
│ item_id (FK)    │
│ created_at      │
└─────────────────┘
```

## リレーションシップ（関係）

### 1. users → posts（1 対 多）
- **関係**: 1 人のユーザーは複数の投稿を作成できる
- **外部キー**: `posts.user_id` → `users.id`
- **削除動作**: CASCADE（ユーザーが削除されると、そのユーザーの投稿も削除される）

### 2. users → items（1 対 多）
- **関係**: 1 人のユーザーは複数のアイテムを出品できる
- **外部キー**: `items.user_id` → `users.id`
- **削除動作**: CASCADE（ユーザーが削除されると、そのユーザーのアイテムも削除される）

### 3. users → likes（1 対 多）
- **関係**: 1 人のユーザーは複数のいいねを付けることができる
- **外部キー**: `likes.user_id` → `users.id`
- **削除動作**: CASCADE（ユーザーが削除されると、そのユーザーのいいねも削除される）

### 4. posts → likes（1 対 多）
- **関係**: 1 つの投稿には複数のいいねを付けることができる
- **外部キー**: `likes.post_id` → `posts.id`
- **削除動作**: CASCADE（投稿が削除されると、その投稿へのいいねも削除される）

### 5. items → likes（1 対 多）
- **関係**: 1 つのアイテムには複数のいいねを付けることができる
- **外部キー**: `likes.item_id` → `items.id`
- **削除動作**: CASCADE（アイテムが削除されると、そのアイテムへのいいねも削除される）

## インデックス

### パフォーマンス最適化のためのインデックス

#### users テーブル
- `username` に UNIQUE インデックス（既に UNIQUE 制約により自動生成）
- `email` に UNIQUE インデックス（既に UNIQUE 制約により自動生成）

#### posts テーブル
- `user_id` にインデックス（外部キー検索の高速化）
- `created_at` にインデックス（時系列ソートの高速化）
- `tags` に GIN インデックス（JSONB 検索の高速化）

#### items テーブル
- `user_id` にインデックス（外部キー検索の高速化）
- `status` にインデックス（ステータス検索の高速化）
- `category` にインデックス（カテゴリ検索の高速化）
- `created_at` にインデックス（時系列ソートの高速化）
- `tags` に GIN インデックス（JSONB 検索の高速化）

#### likes テーブル
- `user_id` にインデックス（外部キー検索の高速化）
- `post_id` にインデックス（外部キー検索の高速化）
- `item_id` にインデックス（外部キー検索の高速化）
- `(user_id, post_id)` に UNIQUE インデックス（重複いいね防止）
- `(user_id, item_id)` に UNIQUE インデックス（重複いいね防止）

## DDL（Data Definition Language）例

```sql
-- users テーブル
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url VARCHAR(500)
);

-- posts テーブル
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_pinned BOOLEAN DEFAULT FALSE,
    tags JSONB
);

-- items テーブル
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'available',
    category VARCHAR(100),
    tags JSONB,
    image_urls TEXT,
    contact_method VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- likes テーブル
CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT check_like_target CHECK (
        (post_id IS NOT NULL AND item_id IS NULL) OR
        (post_id IS NULL AND item_id IS NOT NULL)
    ),
    CONSTRAINT unique_post_like UNIQUE (user_id, post_id),
    CONSTRAINT unique_item_like UNIQUE (user_id, item_id)
);

-- インデックスの作成
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_created_at ON items(created_at);
CREATE INDEX idx_items_tags ON items USING GIN(tags);

CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_item_id ON likes(item_id);
```

## データ整合性

### 制約
- **主キー制約**: 各テーブルの `id` は一意で非 NULL
- **外部キー制約**: 参照整合性を保証
- **一意制約**: `username`、`email`、いいねの重複防止
- **チェック制約**: いいねは投稿またはアイテムのどちらか一方にのみ付けることができる

### トランザクション
- 複数のテーブルにまたがる操作（例: 投稿作成とタグ更新）はトランザクション内で実行
- ACID 特性（原子性、一貫性、独立性、永続性）を保証

## 将来の拡張案

### 追加可能なエンティティ
- **comments（コメント）**: 投稿やアイテムへのコメント
- **notifications（通知）**: ユーザーへの通知
- **follows（フォロー）**: ユーザー間のフォロー関係
- **messages（メッセージ）**: ユーザー間のメッセージング

### 正規化の改善
- **categories テーブル**: カテゴリを別テーブルに分離
- **tags テーブル**: タグを別テーブルに分離し、多対多の関係を実現



