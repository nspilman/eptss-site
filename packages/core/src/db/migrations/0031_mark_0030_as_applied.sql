-- Mark migration 0030 as already applied since tables already exist
-- This manually inserts the migration record into Drizzle's tracking table

INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
VALUES (
  '3039186f-574e-4f80-b094-660545b86f43:0030_clever_kitty_pryde',
  1762030805615
)
ON CONFLICT (hash) DO NOTHING;

-- Verify the migration is marked as applied
SELECT * FROM drizzle.__drizzle_migrations
WHERE hash LIKE '%0030_clever_kitty_pryde%';
