CREATE TABLE "test_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_name" text NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	"duration" integer,
	"started_at" timestamp with time zone DEFAULT now(),
	"environment" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sign_ups" ALTER COLUMN "round_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sign_ups" ALTER COLUMN "song_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sign_ups" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "round_voting_candidate_overrides" ALTER COLUMN "round_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "round_voting_candidate_overrides" ALTER COLUMN "original_round_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "round_voting_candidate_overrides" ALTER COLUMN "song_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "round_voting_candidate_overrides" ALTER COLUMN "created_at" SET NOT NULL;