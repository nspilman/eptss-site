CREATE TYPE "public"."notification_email_type" AS ENUM('new_notifications', 'outstanding_reminder');--> statement-breakpoint
CREATE TABLE "notification_emails_sent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email_type" "notification_email_type" NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"notification_ids" text[],
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text
);
--> statement-breakpoint
ALTER TABLE "user_privacy_settings" ADD COLUMN "notification_emails_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "notification_emails_sent" ADD CONSTRAINT "notification_emails_sent_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE no action ON UPDATE no action;