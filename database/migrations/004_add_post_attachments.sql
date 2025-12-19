-- 添加帖子附件字段支持
-- Migration: 004_add_post_attachments.sql

-- 为posts表添加image_urls和attachments字段
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments JSONB;

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_posts_attachments ON posts USING gin(attachments);

-- 添加注释
COMMENT ON COLUMN posts.image_urls IS 'Comma-separated image URLs';
COMMENT ON COLUMN posts.attachments IS 'JSON array of file attachments with metadata';

