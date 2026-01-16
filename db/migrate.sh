#!/bin/bash
# Database Migration Script
# This script adds missing columns to existing databases

echo "Starting database migration..."

docker-compose exec -T db psql -U postgres -d memoluck <<EOF

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS grade VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add missing columns to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments JSONB;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Add missing columns to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;

-- Verify changes
SELECT 'Migration completed successfully!' AS status;
\d users
\d posts
\d items

EOF

echo "Migration script completed!"

