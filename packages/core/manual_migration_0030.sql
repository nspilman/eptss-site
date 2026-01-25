-- Manual migration for 0030_clever_kitty_pryde
-- Run this script directly in your database

-- Step 1: Add full_name column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name text;

-- Step 2: Mark migration 0030 as applied in Drizzle's tracking table
-- First, let's check the current state (optional - you can run this separately to see existing migrations)
-- SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 5;

-- Insert the migration record
-- The hash format is typically: {uuid}:{migration_name}
INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
VALUES (
  '3039186f-574e-4f80-b094-660545b86f43:0030_clever_kitty_pryde',
  1762030805615
)
ON CONFLICT (hash) DO NOTHING;

-- Step 3: Verify the migration is now marked as applied
SELECT * FROM drizzle.__drizzle_migrations
WHERE hash LIKE '%0030%'
ORDER BY created_at DESC;

-- You should see the 0030 migration in the results
