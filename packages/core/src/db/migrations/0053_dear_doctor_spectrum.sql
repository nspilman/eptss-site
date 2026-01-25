CREATE TYPE "public"."upload_status" AS ENUM('pending', 'committed', 'failed');--> statement-breakpoint
CREATE TABLE "pending_uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bucket" text NOT NULL,
	"file_path" text NOT NULL,
	"file_url" text,
	"uploaded_by" uuid,
	"status" "upload_status" DEFAULT 'pending' NOT NULL,
	"related_table" text,
	"related_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"committed_at" timestamp,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "audio_duration" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "pending_uploads" ADD CONSTRAINT "pending_uploads_uploaded_by_users_userid_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("userid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pending_uploads_status_idx" ON "pending_uploads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pending_uploads_expires_at_idx" ON "pending_uploads" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "pending_uploads_bucket_path_idx" ON "pending_uploads" USING btree ("bucket","file_path");