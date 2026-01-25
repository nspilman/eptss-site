-- Seed Original Songs Project
-- This adds the Original Songs project with a fixed UUID for consistency

INSERT INTO "projects" ("id", "name", "slug", "config", "is_active")
VALUES (
	'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
	'EPTSS Original Songs',
	'original',
	'{"voting_enabled": false}'::jsonb,
	true
)
ON CONFLICT ("id") DO NOTHING;
