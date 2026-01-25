-- Backfill existing data with Cover Project ID
-- This sets all existing rounds, signups, submissions, votes, and email reminders to the Cover Project

UPDATE "round_metadata"
SET "project_id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
WHERE "project_id" IS NULL;

--> statement-breakpoint

UPDATE "sign_ups"
SET "project_id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
WHERE "project_id" IS NULL;

--> statement-breakpoint

UPDATE "submissions"
SET "project_id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
WHERE "project_id" IS NULL;

--> statement-breakpoint

UPDATE "song_selection_votes"
SET "project_id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
WHERE "project_id" IS NULL;

--> statement-breakpoint

UPDATE "email_reminders_sent"
SET "project_id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
WHERE "project_id" IS NULL;
