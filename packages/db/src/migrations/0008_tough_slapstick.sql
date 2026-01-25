DO $$ BEGIN
  -- Drop the table if it exists
  DROP TABLE IF EXISTS "test_runs";

  -- Create the table with the exact schema we want
  CREATE TABLE "test_runs" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
    "test_name" text NOT NULL,
    "status" text NOT NULL,
    "error_message" text,
    "duration" integer,
    "started_at" timestamp with time zone DEFAULT now() NOT NULL,
    "environment" text NOT NULL
  );
END $$;
--> statement-breakpoint
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sign_ups' AND column_name = 'round_id' AND is_nullable = 'YES') THEN
   ALTER TABLE "sign_ups" ALTER COLUMN "round_id" SET NOT NULL;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sign_ups' AND column_name = 'song_id' AND is_nullable = 'YES') THEN
   ALTER TABLE "sign_ups" ALTER COLUMN "song_id" SET NOT NULL;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sign_ups' AND column_name = 'user_id' AND is_nullable = 'YES') THEN
   ALTER TABLE "sign_ups" ALTER COLUMN "user_id" SET NOT NULL;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'round_voting_candidate_overrides' AND column_name = 'round_id' AND is_nullable = 'YES') THEN
   ALTER TABLE "round_voting_candidate_overrides" ALTER COLUMN "round_id" SET NOT NULL;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'round_voting_candidate_overrides' AND column_name = 'original_round_id' AND is_nullable = 'YES') THEN
   ALTER TABLE "round_voting_candidate_overrides" ALTER COLUMN "original_round_id" SET NOT NULL;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'round_voting_candidate_overrides' AND column_name = 'song_id' AND is_nullable = 'YES') THEN
   ALTER TABLE "round_voting_candidate_overrides" ALTER COLUMN "song_id" SET NOT NULL;
 END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'round_voting_candidate_overrides' AND column_name = 'created_at' AND is_nullable = 'YES') THEN
   ALTER TABLE "round_voting_candidate_overrides" ALTER COLUMN "created_at" SET NOT NULL;
 END IF;
END $$;