-- Abstract Landing Pages to be Fully Config-Driven
-- This migration adds SEO metadata, landing page sections, and round info labels to both projects

-- ============================================================================
-- COVER PROJECT (Everyone Plays the Same Song)
-- ============================================================================

-- Add SEO Metadata for Cover Project
UPDATE "projects"
SET "config" = jsonb_set(
  jsonb_set(
    jsonb_set(
      "config",
      '{seo,landingPage}',
      '{"title": "Everyone Plays the Same Song | Quarterly Cover Challenge", "description": "Join our quarterly cover challenge. Our community picks one song every quarter. Everyone creates their own unique cover version. Then we celebrate with a virtual listening party!", "ogTitle": "Everyone Plays the Same Song | Quarterly Cover Challenge", "ogDescription": "Join our quarterly cover challenge. Our community picks one song every quarter. Everyone creates their own unique cover version. Then we celebrate with a virtual listening party!"}'::jsonb
    ),
    '{seo,submitPage}',
    '{"title": "Submit Your Cover | Everyone Plays the Same Song", "description": "Submit your unique cover version for the current round of Everyone Plays the Same Song. Share your musical interpretation with our community.", "ogTitle": "Submit Your Cover | Everyone Plays the Same Song", "ogDescription": "Submit your unique cover version for the current round of Everyone Plays the Same Song. Share your musical interpretation with our community."}'::jsonb
  ),
  '{seo,dashboardPage}',
  '{"title": "Dashboard | Everyone Plays the Same Song", "description": "Your Everyone Plays the Same Song dashboard"}'::jsonb
)
WHERE "id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

--> statement-breakpoint

-- Add How It Works content for Cover Project
UPDATE "projects"
SET "config" = jsonb_set(
  "config",
  '{content,pages,home,howItWorks}',
  '{"sectionTitle": "How It Works", "sectionSubtitle": "A simple process designed to spark your creativity", "steps": {"step1": {"icon": "music", "title": "Choose a Song", "description": "Suggest songs and vote on what we will cover next"}, "step2": {"icon": "calendar", "title": "Create Your Version", "description": "Three months to record your unique interpretation"}, "step3": {"icon": "users", "title": "Share & Connect", "description": "Join our listening party and celebrate together"}}, "benefits": {"benefitsTitle": "Why Musicians Love Us", "benefit1": {"icon": "award", "title": "Creative Freedom", "description": "Express yourself without the pressure of choosing what to create"}, "benefit2": {"icon": "calendar", "title": "Structured Deadlines", "description": "Quarterly projects with clear timelines keep you moving forward"}, "benefit3": {"icon": "users", "title": "Supportive Community", "description": "Connect with fellow musicians who understand your creative journey"}}, "testimonial": {"quote": "Everyone Plays the Same Song provides the community and direction I have needed to consistently make music and improve for the last two years.", "author": "David, Participant"}, "ctaButton": "Join Our Next Round", "ctaLinks": {"faq": "FAQ", "pastRounds": "Past Rounds"}}'::jsonb
)
WHERE "id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

--> statement-breakpoint

-- Add Round Info Labels for Cover Project
UPDATE "projects"
SET "config" = jsonb_set(
  "config",
  '{content,pages,home,roundInfo}',
  '{"signups": {"badge": "Signups Open", "title": "Current Round", "subtitle": "Join the community", "closesPrefix": "Signups close"}, "voting": {"badge": "Voting Open", "title": "Vote for the Song", "subtitle": "Help choose our next cover", "closesPrefix": "Voting closes"}, "covering": {"badge": "Creating Now", "titleFallback": "Cover the Song", "subtitle": "Make it your own", "closesPrefix": "Submit by"}, "celebration": {"badge": "Celebrating", "titleFallback": "Covers Complete", "subtitle": "Listen and celebrate together", "closesPrefix": "Celebration ends"}, "loading": {"badge": "Loading...", "title": "Loading...", "subtitle": "Please wait"}}'::jsonb
)
WHERE "id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

--> statement-breakpoint

-- Add Submissions Gallery content for Cover Project
UPDATE "projects"
SET "config" = jsonb_set(
  "config",
  '{content,pages,home,submissionsGallery}',
  '{"title": "Past Cover Rounds", "subtitle": "Explore the amazing covers from our community", "emptyStateTitle": "Our creative journey is just beginning", "emptyStateMessage": "Be the first to submit a cover this round!", "viewAllLink": "View All Past Rounds"}'::jsonb
)
WHERE "id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

--> statement-breakpoint

-- Add Submit Page content for Cover Project
UPDATE "projects"
SET "config" = jsonb_set(
  "config",
  '{content,pages,submit}',
  '{"title": "Submit Your Cover", "description": "Share your musical creation", "instructions": "Upload your track to SoundCloud and paste the link below", "formTitleWithSong": "Submit your cover of {{songTitle}} by {{songArtist}}", "formTitleNoSong": "Submit your cover", "formDescriptionPrefix": "Submit your cover by", "submitButtonText": "Submit Cover", "successMessage": "Your cover has been submitted successfully", "submittingText": "Submitting..."}'::jsonb
)
WHERE "id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

--> statement-breakpoint

-- ============================================================================
-- MONTHLY ORIGINAL PROJECT
-- ============================================================================

-- Add SEO Metadata for Monthly Original Project
UPDATE "projects"
SET "config" = jsonb_set(
  jsonb_set(
    jsonb_set(
      "config",
      '{seo,landingPage}',
      '{"title": "Monthly Original Song Challenge | Create Your Own Music", "description": "Join our monthly original songwriting challenge. Write and record an original song every month with a supportive community of musicians and songwriters.", "ogTitle": "Monthly Original Song Challenge | Create Your Own Music", "ogDescription": "Join our monthly original songwriting challenge. Write and record an original song every month with a supportive community of musicians and songwriters."}'::jsonb
    ),
    '{seo,submitPage}',
    '{"title": "Submit Your Original Song | Monthly Original Challenge", "description": "Submit your original song for the current monthly challenge. Share your creative work with our songwriting community.", "ogTitle": "Submit Your Original Song | Monthly Original Challenge", "ogDescription": "Submit your original song for the current monthly challenge. Share your creative work with our songwriting community."}'::jsonb
  ),
  '{seo,dashboardPage}',
  '{"title": "Dashboard | Monthly Original Challenge", "description": "Your Monthly Original Challenge dashboard"}'::jsonb
)
WHERE "id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

--> statement-breakpoint

-- Add How It Works content for Monthly Original Project
UPDATE "projects"
SET "config" = jsonb_set(
  "config",
  '{content,pages,home,howItWorks}',
  '{"sectionTitle": "How It Works", "sectionSubtitle": "A simple monthly process to nurture your songwriting", "steps": {"step1": {"icon": "lightbulb", "title": "Get Inspired", "description": "Each month starts with a new theme or prompt to spark your creativity"}, "step2": {"icon": "music", "title": "Write & Record", "description": "Create your original song - lyrics, melody, and recording"}, "step3": {"icon": "users", "title": "Share & Celebrate", "description": "Submit your work and celebrate with fellow songwriters"}}, "benefits": {"benefitsTitle": "Why Songwriters Love This", "benefit1": {"icon": "calendar", "title": "Monthly Momentum", "description": "Regular deadlines help you develop a consistent songwriting practice"}, "benefit2": {"icon": "mic", "title": "Creative Freedom", "description": "Any genre, any style - express yourself however you want"}, "benefit3": {"icon": "heart", "title": "Supportive Community", "description": "Connect with other songwriters who celebrate your creative journey"}}, "testimonial": {"quote": "The monthly original song challenge has transformed my songwriting. Having a deadline and a community keeps me creating consistently.", "author": "Sarah, Songwriter"}, "ctaButton": "Join This Month", "ctaLinks": {"faq": "FAQ", "pastRounds": "Past Submissions"}}'::jsonb
)
WHERE "id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

--> statement-breakpoint

-- Add Round Info Labels for Monthly Original Project
UPDATE "projects"
SET "config" = jsonb_set(
  "config",
  '{content,pages,home,roundInfo}',
  '{"signups": {"badge": "Signups Open", "title": "This Month''s Challenge", "subtitle": "Join the songwriting community", "closesPrefix": "Signups close"}, "voting": {"badge": "Theme Selection", "title": "Vote for This Month''s Theme", "subtitle": "Help choose our creative prompt", "closesPrefix": "Voting closes"}, "covering": {"badge": "Creating Now", "titleFallback": "Write Your Original", "subtitle": "Monthly songwriting challenge", "closesPrefix": "Submit by"}, "celebration": {"badge": "Celebrating", "titleFallback": "Songs Complete", "subtitle": "Listen and celebrate together", "closesPrefix": "Celebration ends"}, "loading": {"badge": "Loading...", "title": "Loading...", "subtitle": "Please wait"}}'::jsonb
)
WHERE "id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

--> statement-breakpoint

-- Add Submissions Gallery content for Monthly Original Project
UPDATE "projects"
SET "config" = jsonb_set(
  "config",
  '{content,pages,home,submissionsGallery}',
  '{"title": "Past Original Songs", "subtitle": "Discover the creativity of our songwriting community", "emptyStateTitle": "Our creative journey is just beginning", "emptyStateMessage": "Be the first to create an original song this month!", "viewAllLink": "View All Past Rounds"}'::jsonb
)
WHERE "id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

--> statement-breakpoint

-- Add Submit Page content for Monthly Original Project
UPDATE "projects"
SET "config" = jsonb_set(
  "config",
  '{content,pages,submit}',
  '{"title": "Submit Your Original Song", "description": "Share your creative work", "instructions": "Upload your track to SoundCloud and paste the link below", "formTitleWithSong": "Submit your original song", "formTitleNoSong": "Submit your original song", "formDescriptionPrefix": "Submit your song by", "submitButtonText": "Submit Song", "successMessage": "Your original song has been submitted successfully", "submittingText": "Submitting..."}'::jsonb
)
WHERE "id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
