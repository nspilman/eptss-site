CREATE TABLE "bot_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"captcha_score" text,
	"attempt_type" text NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "public_display_name" text;--> statement-breakpoint
ALTER TABLE "user_privacy_settings" DROP COLUMN IF EXISTS "public_display_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "full_name";