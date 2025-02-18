CREATE TABLE IF NOT EXISTS "mailing_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "mailing_list_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "round_voting_candidate_overrides" (
	"id" bigint PRIMARY KEY NOT NULL,
	"round_id" bigint,
	"original_round_id" bigint,
	"song_id" bigint,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'round_voting_candidate_overrides_round_id_round_metadata_id_fk') THEN
 ALTER TABLE "round_voting_candidate_overrides" ADD CONSTRAINT "round_voting_candidate_overrides_round_id_round_metadata_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round_metadata"("id") ON DELETE no action ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'round_voting_candidate_overrides_original_round_id_round_metadata_id_fk') THEN
 ALTER TABLE "round_voting_candidate_overrides" ADD CONSTRAINT "round_voting_candidate_overrides_original_round_id_round_metadata_id_fk" FOREIGN KEY ("original_round_id") REFERENCES "public"."round_metadata"("id") ON DELETE no action ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'round_voting_candidate_overrides_song_id_songs_id_fk') THEN
 ALTER TABLE "round_voting_candidate_overrides" ADD CONSTRAINT "round_voting_candidate_overrides_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'round_metadata' AND column_name = 'roundTypeOverride') THEN
 ALTER TABLE "round_metadata" DROP COLUMN "roundTypeOverride";
 END IF;
END $$;