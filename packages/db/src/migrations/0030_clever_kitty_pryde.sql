CREATE TABLE "content_tags" (
	"content_id" uuid NOT NULL,
	"tag_id" bigint NOT NULL,
	"added_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" text,
	"is_system_tag" boolean DEFAULT false NOT NULL,
	"use_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"round_id" bigint NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"markdown_content" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	CONSTRAINT "user_content_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_privacy_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"show_stats" boolean DEFAULT true NOT NULL,
	"show_signups" boolean DEFAULT true NOT NULL,
	"show_submissions" boolean DEFAULT true NOT NULL,
	"show_votes" boolean DEFAULT false NOT NULL,
	"show_email" boolean DEFAULT false NOT NULL,
	"public_display_name" text,
	"profile_bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_privacy_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "full_name" text;--> statement-breakpoint
ALTER TABLE "content_tags" ADD CONSTRAINT "content_tags_content_id_user_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."user_content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_tags" ADD CONSTRAINT "content_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_content" ADD CONSTRAINT "user_content_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_content" ADD CONSTRAINT "user_content_round_id_round_metadata_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round_metadata"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_privacy_settings" ADD CONSTRAINT "user_privacy_settings_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE cascade ON UPDATE no action;

CREATE TABLE IF NOT EXISTS user_privacy_settings (                                         │
   id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,                                  │
   user_id UUID NOT NULL UNIQUE,                                                            │
   show_stats BOOLEAN DEFAULT true NOT NULL,                                                │
   show_signups BOOLEAN DEFAULT true NOT NULL,                                              │
   show_submissions BOOLEAN DEFAULT true NOT NULL,                                          │
   show_votes BOOLEAN DEFAULT false NOT NULL,                                               │
   show_email BOOLEAN DEFAULT false NOT NULL,                                               │
   public_display_name TEXT, 