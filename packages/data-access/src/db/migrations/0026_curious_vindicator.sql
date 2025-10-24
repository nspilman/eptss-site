CREATE TABLE "unverified_signups" (
	"id" bigint PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"email" text NOT NULL,
	"song_title" text NOT NULL,
	"artist" text NOT NULL,
	"youtube_link" text NOT NULL,
	"additional_comments" text,
	"round_id" bigint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "unverified_signups" ADD CONSTRAINT "unverified_signups_round_id_round_metadata_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round_metadata"("id") ON DELETE no action ON UPDATE no action;