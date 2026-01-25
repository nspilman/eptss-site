-- Create reminder email type enum
CREATE TYPE "public"."reminder_email_type" AS ENUM(
  'voting_closes_tomorrow',
  'covering_halfway',
  'covering_one_month_left',
  'covering_last_week',
  'covers_due_tomorrow'
);

-- Create email_reminders_sent table
CREATE TABLE IF NOT EXISTS "email_reminders_sent" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "round_id" bigint NOT NULL,
  "user_id" uuid NOT NULL,
  "email_type" "reminder_email_type" NOT NULL,
  "sent_at" timestamp DEFAULT now() NOT NULL,
  "success" boolean DEFAULT true NOT NULL,
  "error_message" text,
  CONSTRAINT "email_reminders_sent_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "round_metadata"("id"),
  CONSTRAINT "email_reminders_sent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("userid")
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "email_reminders_sent_round_user_type_idx" ON "email_reminders_sent" ("round_id", "user_id", "email_type");
CREATE INDEX IF NOT EXISTS "email_reminders_sent_round_type_idx" ON "email_reminders_sent" ("round_id", "email_type");
