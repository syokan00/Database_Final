-- users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname VARCHAR(64),
  major VARCHAR(128),
  year INT,
  grade VARCHAR(64),
  language_preference VARCHAR(8) DEFAULT 'ja',
  avatar_url TEXT,
  cover_image_url TEXT,
  bio TEXT,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- badges master table
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon TEXT
);

-- posts
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  author_id INT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_language VARCHAR(8) NOT NULL, -- 'ja'|'zh'|'en'
  category VARCHAR(50) DEFAULT 'other',
  tags TEXT, -- comma separated
  restriction_type VARCHAR(50), -- e.g. 'no-kanji', 'emoji-only'
  image_urls TEXT, -- comma separated image URLs
  attachments JSONB, -- JSON array of file attachments [{url, filename, size, type, category}]
  translated_cache JSONB, -- {"ja":"..","zh":"..","en":".."}
  is_translated BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- translations (optional normalized)
CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  lang VARCHAR(8) NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, lang)
);

-- comments
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  author_id INT REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  parent_id INT REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- likes (unique constraint ensures one-per-user-per-post)
CREATE TABLE IF NOT EXISTS likes (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- items (二手)
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'selling', -- selling/sold
  category VARCHAR(50) DEFAULT 'other',
  tags TEXT, -- comma separated
  image_urls TEXT, -- comma separated
  contact_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- badges relationship
CREATE TABLE IF NOT EXISTS user_badges (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  badge_id INT REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY(user_id, badge_id)
);

-- favorites (收藏)
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- index for posts search
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN (to_tsvector('english', coalesce(tags,'')));

-- Initial Badges Data
INSERT INTO badges (name, description, icon) VALUES
('first_post', 'First post created', '🥚'),
('night_owl', 'Posted between 0:00-6:00', '⭐'),
('streak_poster', 'Posted 5 days in a row', '🔥'),
('polyglot', 'Posted in multiple languages', '💬'),
('heart_collector', 'Received 10 likes', '❤️'),
('comment_king', 'Posted 20 comments', '👑'),
('helpful_friend', 'Comment liked 5 times', '🛡️'),
('smart_buyer', 'Bought 3 items', '🛍️'),
('top_seller', 'Sold 5 items', '🏷️'),
('treasure_hunter', 'Found a rare item', '🧭'),
('lucky_clover', 'Completed a random task', '⚡'),
('heart_artist', 'Used like effect 10 times', '🎨'),
('brave_beginner', 'First login', '👶'),
('lost_scholar', 'Visited all pages', '🗺️')
ON CONFLICT (name) DO NOTHING;
