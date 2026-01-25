ALTER TABLE "round_metadata" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "round_metadata" ADD CONSTRAINT "round_metadata_slug_unique" UNIQUE("slug");