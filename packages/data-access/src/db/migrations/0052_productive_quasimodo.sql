ALTER TABLE "submissions" ALTER COLUMN "soundcloud_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "audio_file_url" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "audio_file_path" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "cover_image_path" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "audio_duration" integer;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "audio_file_size" integer;