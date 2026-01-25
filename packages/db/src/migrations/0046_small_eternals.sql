ALTER TABLE "sign_ups" ALTER COLUMN "youtube_link" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sign_ups" ALTER COLUMN "song_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "unverified_signups" ALTER COLUMN "song_title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "unverified_signups" ALTER COLUMN "artist" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "unverified_signups" ALTER COLUMN "youtube_link" DROP NOT NULL;