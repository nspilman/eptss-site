CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "idx_projects_slug" ON "projects" USING btree ("slug");
--> statement-breakpoint
-- Seed Cover Project with fixed UUID
INSERT INTO "projects" ("id", "name", "slug", "config", "is_active")
VALUES (
	'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
	'EPTSS Cover Project',
	'cover',
	'{"voting_enabled": true}'::jsonb,
	true
)
ON CONFLICT ("id") DO NOTHING;