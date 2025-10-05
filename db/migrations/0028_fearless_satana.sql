CREATE TYPE "public"."reminder_email_type" AS ENUM('voting_closes_tomorrow', 'covering_halfway', 'covering_one_month_left', 'covering_last_week', 'covers_due_tomorrow');--> statement-breakpoint
CREATE TABLE "email_reminders_sent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_id" bigint NOT NULL,
	"user_id" uuid NOT NULL,
	"email_type" "reminder_email_type" NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"success" boolean DEFAULT true NOT NULL,
	"error_message" text
);
--> statement-breakpoint
ALTER TABLE "email_reminders_sent" ADD CONSTRAINT "email_reminders_sent_round_id_round_metadata_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."round_metadata"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_reminders_sent" ADD CONSTRAINT "email_reminders_sent_user_id_users_userid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("userid") ON DELETE no action ON UPDATE no action;