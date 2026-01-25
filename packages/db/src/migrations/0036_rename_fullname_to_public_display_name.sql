-- Rename full_name column to public_display_name in users table
ALTER TABLE "users" RENAME COLUMN "full_name" TO "public_display_name";

-- Drop public_display_name column from user_privacy_settings table (now consolidated in users table)
ALTER TABLE "user_privacy_settings" DROP COLUMN IF EXISTS "public_display_name";
