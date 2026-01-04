-- Create upload status enum
CREATE TYPE "public"."upload_status" AS ENUM('pending', 'committed', 'failed');

-- Create pending_uploads table
CREATE TABLE IF NOT EXISTS "pending_uploads" (
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

-- Add foreign key constraint
ALTER TABLE "pending_uploads" ADD CONSTRAINT "pending_uploads_uploaded_by_users_userid_fk"
  FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("userid") ON DELETE set null ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "pending_uploads_status_idx" ON "pending_uploads" USING btree ("status");
CREATE INDEX IF NOT EXISTS "pending_uploads_expires_at_idx" ON "pending_uploads" USING btree ("expires_at");
CREATE INDEX IF NOT EXISTS "pending_uploads_bucket_path_idx" ON "pending_uploads" USING btree ("bucket","file_path");
