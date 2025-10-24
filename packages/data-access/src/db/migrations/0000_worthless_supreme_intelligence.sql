CREATE TABLE IF NOT EXISTS "round_metadata" (
	"id" bigint PRIMARY KEY NOT NULL,
	"playlist_url" text,
	"song_id" bigint,
	"created_at" timestamp DEFAULT now(),
	"signup_opens" timestamp,
	"voting_opens" timestamp,
	"covering_begins" timestamp,
	"covers_due" timestamp,
	"listening_party" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sign_ups" (
	"id" bigint PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"youtube_link" text NOT NULL,
	"additional_comments" text,
	"round_id" bigint,
	"song_id" bigint,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "song_selection_votes" (
	"id" bigint PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"song_id" bigint,
	"vote" integer NOT NULL,
	"submitter_email" text,
	"round_id" bigint,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "songs" (
	"id" bigint PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"title" text NOT NULL,
	"artist" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "submissions" (
	"id" bigint PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"soundcloud_url" text NOT NULL,
	"round_id" bigint,
	"additional_comments" text,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_roles" (
	"id" bigint PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" uuid,
	"admin_level" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_share_permissions" (
	"id" bigint PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"user_id" uuid,
	"can_share_bsky" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"userid" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"username" text,
	"admin_level" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'round_metadata_song_id_songs_id_fk') THEN
 ALTER TABLE "round_metadata" ADD CONSTRAINT "round_metadata_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sign_ups_round_id_round_metadata_id_fk') THEN
 ALTER TABLE "sign_ups" ADD CONSTRAINT "sign_ups_round_id_round_metadata_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round_metadata"("id") ON DELETE no action ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sign_ups_song_id_songs_id_fk') THEN
 ALTER TABLE "sign_ups" ADD CONSTRAINT "sign_ups_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sign_ups_user_id_users_userid_fk') THEN
 ALTER TABLE "sign_ups" ADD CONSTRAINT "sign_ups_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE no action ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'song_selection_votes_song_id_songs_id_fk') THEN
 ALTER TABLE "song_selection_votes" ADD CONSTRAINT "song_selection_votes_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE no action ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'song_selection_votes_round_id_round_metadata_id_fk') THEN
 ALTER TABLE "song_selection_votes" ADD CONSTRAINT "song_selection_votes_round_id_round_metadata_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round_metadata"("id") ON DELETE no action ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'song_selection_votes_user_id_users_userid_fk') THEN
 ALTER TABLE "song_selection_votes" ADD CONSTRAINT "song_selection_votes_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE no action ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'submissions_round_id_round_metadata_id_fk') THEN
 ALTER TABLE "submissions" ADD CONSTRAINT "submissions_round_id_round_metadata_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round_metadata"("id") ON DELETE no action ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'submissions_user_id_users_userid_fk') THEN
 ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE no action ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_users_userid_fk') THEN
 ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE no action ON UPDATE no action;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_share_permissions_user_id_users_userid_fk') THEN
 ALTER TABLE "user_share_permissions" ADD CONSTRAINT "user_share_permissions_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE cascade;
 END IF;
END $$;