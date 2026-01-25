-- Update Project Configs for requireSongOnSignup
-- Cover project: require song on signup (traditional EPTSS flow)
-- Monthly Originals project: don't require song on signup (participants write originals)

-- Update Cover Project
UPDATE "projects"
SET "config" = jsonb_set(
  COALESCE("config", '{}'::jsonb),
  '{businessRules,requireSongOnSignup}',
  'true'::jsonb
)
WHERE "id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

--> statement-breakpoint

-- Update Monthly Originals Project
UPDATE "projects"
SET "config" = jsonb_set(
  COALESCE("config", '{}'::jsonb),
  '{businessRules,requireSongOnSignup}',
  'false'::jsonb
)
WHERE "id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
