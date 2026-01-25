-- Add Landing Page Content Configuration for Projects

-- Update Cover Project with cover-specific hero content
UPDATE "projects"
SET "config" = jsonb_set(
  "config",
  '{content,pages,home,hero}',
  '{"tagline": "Quarterly Cover Challenge", "title": "Everyone Plays", "subtitle": "The Same Song", "description": "Every quarter, our community picks one song. Everyone creates their own unique cover version. Then we celebrate with a virtual listening party!", "ctaPrimary": "Join Next Round", "ctaSecondary": "Learn More", "benefits": "All skill levels welcome • Any genre • Community celebration"}'::jsonb
)
WHERE "id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

--> statement-breakpoint

-- Update Monthly Originals Project with originals-specific hero content (defaults are already set in schema)
UPDATE "projects"
SET "config" = jsonb_set(
  "config",
  '{content,pages,home,hero}',
  '{"tagline": "Monthly Songwriting Challenge", "title": "Create Your Own", "subtitle": "Original Song", "description": "Every month, write and record an original song. Share your creativity with a supportive community of songwriters and musicians.", "ctaPrimary": "Start Creating", "ctaSecondary": "Learn More", "benefits": "No experience required • All genres welcome • Free to join"}'::jsonb
)
WHERE "id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
