ALTER TABLE "email_reminders_sent" ALTER COLUMN "project_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "round_metadata" ALTER COLUMN "project_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sign_ups" ALTER COLUMN "project_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "song_selection_votes" ALTER COLUMN "project_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "project_id" SET NOT NULL;