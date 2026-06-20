CREATE TABLE "atproto_oauth_state" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_atproto_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"did" text NOT NULL,
	"handle" text,
	"oauth_session" jsonb,
	"linked_at" timestamp DEFAULT now() NOT NULL,
	"unlinked_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "user_atproto_identities" ADD CONSTRAINT "user_atproto_identities_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "atproto_oauth_state_expires_at_idx" ON "atproto_oauth_state" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_atproto_identities_active_idx" ON "user_atproto_identities" USING btree ("user_id","did") WHERE "user_atproto_identities"."unlinked_at" IS NULL;--> statement-breakpoint
CREATE INDEX "user_atproto_identities_did_idx" ON "user_atproto_identities" USING btree ("did");--> statement-breakpoint
CREATE INDEX "user_atproto_identities_user_id_idx" ON "user_atproto_identities" USING btree ("user_id");