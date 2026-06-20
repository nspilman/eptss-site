CREATE TABLE "atproto_oauth_sessions" (
	"did" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_atproto_identities" DROP COLUMN "oauth_session";