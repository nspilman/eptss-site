ALTER TABLE "projects" ADD COLUMN "archived_at" timestamp with time zone;
--> statement-breakpoint

-- Archive the Monthly Originals project. The website is reverting to a
-- single-project experience (Cover Songs only); archived projects are
-- hidden from public surfaces but remain visible in admin views.
UPDATE "projects"
SET "archived_at" = NOW()
WHERE "id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
