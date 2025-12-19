-- 添加用户个人资料字段
-- Migration: 005_add_user_profile_fields.sql

-- 添加学年字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS grade VARCHAR(20);

-- 添加个人背景图字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 添加个人简介字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- 添加注释
COMMENT ON COLUMN users.grade IS '学年：大一、大二、大三、大四、M1、M2、D1等';
COMMENT ON COLUMN users.cover_image_url IS '个人主页背景图URL';
COMMENT ON COLUMN users.bio IS '个人简介';

