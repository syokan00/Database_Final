-- Create Read-Only Database User for Demo
-- Run this in Supabase SQL Editor after running init.sql
-- This user can only SELECT (read) data, cannot INSERT, UPDATE, or DELETE

-- Create readonly user (password can be safely shared)
CREATE USER readonly_demo WITH PASSWORD 'demo_readonly_2024';

-- Grant connection permission
GRANT CONNECT ON DATABASE postgres TO readonly_demo;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO readonly_demo;

-- Grant SELECT on all existing tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_demo;

-- Grant SELECT on all future tables (automatic)
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT ON TABLES TO readonly_demo;

-- Grant sequence permissions (for ID generation - needed by some ORMs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO readonly_demo;
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT USAGE, SELECT ON SEQUENCES TO readonly_demo;

-- Note: This user CANNOT:
-- - INSERT, UPDATE, DELETE data
-- - CREATE, ALTER, DROP tables
-- - Register new users or create posts
-- 
-- This user CAN:
-- - SELECT (read) all data
-- - View posts, items, users, etc.
-- - Perfect for demo/sharing purposes

