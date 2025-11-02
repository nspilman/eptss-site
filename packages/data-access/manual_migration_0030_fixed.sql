-- Mark migration 0030 as applied
-- Simpler version without ON CONFLICT

-- First check if it already exists (optional check)
SELECT * FROM drizzle.__drizzle_migrations
WHERE hash LIKE '%0030%';

-- If it doesn't exist, insert it
-- (You can skip this if the SELECT above shows results)
INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
SELECT
  '3039186f-574e-4f80-b094-660545b86f43:0030_clever_kitty_pryde',
  1762030805615
WHERE NOT EXISTS (
  SELECT 1 FROM drizzle.__drizzle_migrations
  WHERE hash = '3039186f-574e-4f80-b094-660545b86f43:0030_clever_kitty_pryde'
);

-- Verify it worked
SELECT hash, created_at FROM drizzle.__drizzle_migrations
ORDER BY created_at DESC
LIMIT 5;
