@echo off
REM Database Migration Script for Windows
REM This script adds missing columns to existing databases

echo Starting database migration...

docker-compose exec -T db psql -U postgres -d memoluck -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS grade VARCHAR(64);"
docker-compose exec -T db psql -U postgres -d memoluck -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;"
docker-compose exec -T db psql -U postgres -d memoluck -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;"

docker-compose exec -T db psql -U postgres -d memoluck -c "ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls TEXT;"
docker-compose exec -T db psql -U postgres -d memoluck -c "ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments JSONB;"
docker-compose exec -T db psql -U postgres -d memoluck -c "ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;"

docker-compose exec -T db psql -U postgres -d memoluck -c "ALTER TABLE items ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;"

echo.
echo Migration completed successfully!
echo.

REM Verify changes
echo Verifying users table structure:
docker-compose exec -T db psql -U postgres -d memoluck -c "\d users"

pause

