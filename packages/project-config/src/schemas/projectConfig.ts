import { z } from "zod";

// ============================================================================
// FEATURE FLAGS
// ============================================================================

/**
 * Feature flags to enable/disable functionality per project
 */
export const featureFlagsSchema = z.object({
  enableVoting: z.boolean().default(true),
  enableSubmissions: z.boolean().default(true),
  enableReflections: z.boolean().default(true),
  enableDiscussions: z.boolean().default(true),
  enableInvites: z.boolean().default(true),
  enableSocialSharing: z.boolean().default(true),
}).default({});

// ============================================================================
// UI CUSTOMIZATION
// ============================================================================

/**
 * UI and branding customization per project
 */
export const uiConfigSchema = z.object({
  primaryColor: z.string().default("#3b82f6"),
  accentColor: z.string().default("#8b5cf6"),
  logoUrl: z.string().url().optional(),
  favicon: z.string().url().optional(),
  theme: z.enum(["light", "dark", "auto"]).default("auto"),
}).default({});

// ============================================================================
// BUSINESS RULES
// ============================================================================

/**
 * Business rules and constraints per project
 */
export const businessRulesSchema = z.object({
  maxSubmissionsPerRound: z.number().int().positive().default(1),
  maxVotesPerUser: z.number().int().positive().default(3),
  requireEmailVerification: z.boolean().default(true),
  requireSongOnSignup: z.boolean().default(true),
  minVotingDurationDays: z.number().int().positive().default(3),
  maxVotingDurationDays: z.number().int().positive().default(14),
  defaultRoundDurationWeeks: z.number().int().positive().default(4),
  allowLateSubmissions: z.boolean().default(false),
  lateSubmissionGracePeriodHours: z.number().int().nonnegative().default(0),
}).default({});

// ============================================================================
// AUTOMATION & CRON JOBS
// ============================================================================

/**
 * Automation and cron job configuration per project
 */
export const automationSchema = z.object({
  enableEmailReminders: z.boolean().default(true),
  enableRoundAutoCreation: z.boolean().default(false),
  enableSongAssignment: z.boolean().default(false),
  roundCreationLeadTimeDays: z.number().int().positive().default(30),
}).default({});

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * Email template customization per project
 */
export const emailConfigSchema = z.object({
  fromName: z.string().default("EPTSS"),
  replyToEmail: z.string().email().optional(),
  templates: z.object({
    signupConfirmation: z.object({
      subject: z.string().default("You're signed up!"),
      greeting: z.string().default("Thanks for signing up"),
    }).default({}),
    votingOpened: z.object({
      subject: z.string().default("Voting is now open"),
      greeting: z.string().default("Time to vote"),
    }).default({}),
    submissionReminder: z.object({
      subject: z.string().default("Submission deadline approaching"),
      greeting: z.string().default("Don't forget to submit"),
    }).default({}),
  }).default({}),
}).default({});

// ============================================================================
// TERMINOLOGY & NAMING
// ============================================================================

/**
 * Customizable terminology for rounds and phases per project
 */
export const terminologySchema = z.object({
  // Round naming
  roundPrefix: z.string().default("Round"), // e.g., "Round" for "Round 32" or "Month" for "January 2025"
  useRoundNumber: z.boolean().default(true), // Whether to show round numbers
  roundFormat: z.enum(["number", "month", "custom"]).default("number"), // How to display rounds

  // Phase names
  phases: z.object({
    signups: z.string().default("Song Selection & Signups"),
    voting: z.string().default("Voting Phase"),
    covering: z.string().default("Covering Phase"),
    celebration: z.string().default("Listening Party"),
  }).default({}),

  // Phase short names (for navigation breadcrumbs)
  phaseShortNames: z.object({
    signups: z.string().default("Sign Up"),
    voting: z.string().default("Vote"),
    covering: z.string().default("Cover"),
    celebration: z.string().default("Listen"),
  }).default({}),

  // Phase descriptions
  phaseDescriptions: z.object({
    signups: z.string().default("Suggest a song and sign up to participate"),
    voting: z.string().default("Vote on which song should be covered this round"),
    covering: z.string().default("Record and submit your cover of the selected song"),
    celebration: z.string().default("Join us for the listening party event!"),
  }).default({}),
}).default({});

// ============================================================================
// STATIC CONTENT
// ============================================================================

/**
 * Project landing page metadata for project index/listing pages
 */
export const projectMetadataSchema = z.object({
  description: z.string().default("A music community project"),
  tagline: z.string().optional(),
  icon: z.enum(["music", "vote", "trophy", "users", "sparkles"]).default("music"),
  accentColor: z.string().default("#3b82f6"), // For card highlights/gradients
}).default({});

/**
 * SEO and OpenGraph metadata per project
 */
export const seoMetadataSchema = z.object({
  // Landing page metadata
  landingPage: z.object({
    title: z.string().default("Music Community Project"),
    description: z.string().default("Join our creative music community"),
    ogTitle: z.string().optional(), // Falls back to title if not specified
    ogDescription: z.string().optional(), // Falls back to description if not specified
  }).default({}),

  // Submit page metadata
  submitPage: z.object({
    title: z.string().default("Submit Your Music"),
    description: z.string().default("Share your musical creation with our community"),
    ogTitle: z.string().optional(),
    ogDescription: z.string().optional(),
  }).default({}),

  // Dashboard metadata
  dashboardPage: z.object({
    title: z.string().default("Dashboard"),
    description: z.string().default("Your project dashboard"),
  }).default({}),
}).default({});

/**
 * How It Works section configuration
 */
export const howItWorksSchema = z.object({
  sectionTitle: z.string().default("How It Works"),
  sectionSubtitle: z.string().default("A simple process designed to spark your creativity"),

  steps: z.object({
    step1: z.object({
      icon: z.enum(["music", "lightbulb", "calendar", "users", "mic", "award"]).default("music"),
      title: z.string().default("Step 1"),
      description: z.string().default("Get started with your creative journey"),
    }).default({}),
    step2: z.object({
      icon: z.enum(["music", "lightbulb", "calendar", "users", "mic", "award"]).default("music"),
      title: z.string().default("Step 2"),
      description: z.string().default("Create your musical project"),
    }).default({}),
    step3: z.object({
      icon: z.enum(["music", "lightbulb", "calendar", "users", "mic", "award"]).default("users"),
      title: z.string().default("Step 3"),
      description: z.string().default("Share and celebrate with the community"),
    }).default({}),
  }).default({}),

  benefits: z.object({
    benefitsTitle: z.string().default("Why Musicians Love Us"),
    benefit1: z.object({
      icon: z.enum(["award", "calendar", "users", "heart", "sparkles", "mic"]).default("award"),
      title: z.string().default("Benefit 1"),
      description: z.string().default("Experience the advantages of our community"),
    }).default({}),
    benefit2: z.object({
      icon: z.enum(["award", "calendar", "users", "heart", "sparkles", "mic"]).default("calendar"),
      title: z.string().default("Benefit 2"),
      description: z.string().default("Structured approach to your creativity"),
    }).default({}),
    benefit3: z.object({
      icon: z.enum(["award", "calendar", "users", "heart", "sparkles", "mic"]).default("users"),
      title: z.string().default("Benefit 3"),
      description: z.string().default("Connect with fellow musicians"),
    }).default({}),
  }).default({}),

  testimonial: z.object({
    quote: z.string().default("This community has transformed my musical journey!"),
    author: z.string().default("Community Member"),
  }).default({}),

  ctaButton: z.string().default("Join Our Next Round"),
  ctaLinks: z.object({
    faq: z.string().default("FAQ"),
    pastRounds: z.string().default("Past Rounds"),
  }).default({}),
}).default({});

/**
 * Round info card labels per phase
 */
export const roundInfoLabelsSchema = z.object({
  signups: z.object({
    badge: z.string().default("Signups Open"),
    title: z.string().default("Current Round"),
    subtitle: z.string().default("Join the community"),
    closesPrefix: z.string().default("Signups close"),
  }).default({}),
  voting: z.object({
    badge: z.string().default("Voting Open"),
    title: z.string().default("Vote Now"),
    subtitle: z.string().default("Help choose our song"),
    closesPrefix: z.string().default("Voting closes"),
  }).default({}),
  covering: z.object({
    badge: z.string().default("Creating Now"),
    titleFallback: z.string().default("Create Your Music"), // Used if no song title
    subtitle: z.string().default("Make it your own"),
    closesPrefix: z.string().default("Submit by"),
  }).default({}),
  celebration: z.object({
    badge: z.string().default("Celebrating"),
    titleFallback: z.string().default("Music Complete"), // Used if no song title
    subtitle: z.string().default("Listen and celebrate together"),
    closesPrefix: z.string().default("Celebration ends"),
  }).default({}),
  loading: z.object({
    badge: z.string().default("Loading..."),
    title: z.string().default("Loading..."),
    subtitle: z.string().default("Please wait"),
  }).default({}),
}).default({});

/**
 * Submissions gallery content
 */
export const submissionsGallerySchema = z.object({
  title: z.string().default("Past Submissions"),
  subtitle: z.string().default("Discover the creativity of our community"),
  emptyStateTitle: z.string().default("Our creative journey is just beginning"),
  emptyStateMessage: z.string().default("Be the first to create music this round!"),
  viewAllLink: z.string().default("View All Past Rounds"),
}).default({});

/**
 * Page copy and descriptions per project
 */
export const pageContentSchema = z.object({
  home: z.object({
    hero: z.object({
      tagline: z.string().default("Monthly Songwriting Challenge"),
      title: z.string().default("Welcome to EPTSS"),
      subtitle: z.string().default("Create and share music together"),
      description: z.string().default("Every month, write and record an original song. Share your creativity with a supportive community of songwriters and musicians."),
      ctaPrimary: z.string().default("Get Started"),
      ctaSecondary: z.string().default("Learn More"),
      benefits: z.string().default("No experience required • All genres welcome • Free to join"),
    }).default({}),
    howItWorks: howItWorksSchema,
    roundInfo: roundInfoLabelsSchema,
    submissionsGallery: submissionsGallerySchema,
  }).default({}),

  dashboard: z.object({
    title: z.string().default("Dashboard"),
    welcomeMessage: z.string().default("Welcome back!"),
  }).default({}),

  voting: z.object({
    title: z.string().default("Vote for Songs"),
    description: z.string().default("Vote for your favorite songs"),
    instructions: z.string().default("Select up to 3 songs to vote for"),
  }).default({}),

  submit: z.object({
    title: z.string().default("Submit Your Cover"),
    description: z.string().default("Share your musical creation"),
    instructions: z.string().default("Upload your track to SoundCloud and paste the link below"),
    // Dynamic form content
    formTitleWithSong: z.string().default("Submit your cover of {{songTitle}} by {{songArtist}}"), // Template with placeholders
    formTitleNoSong: z.string().default("Submit your music"),
    formDescriptionPrefix: z.string().default("Submit your cover by"),
    submitButtonText: z.string().default("Submit Cover"),
    successMessage: z.string().default("Your cover has been submitted successfully"),
    submittingText: z.string().default("Submitting..."),
  }).default({}),

  signup: z.object({
    loggedInWelcomeText: z.string().default("You're all set! Just pick a song below to sign up for this round."),
  }).default({}),
}).default({});

/**
 * FAQ and documentation content per project
 */
export const faqContentSchema = z.object({
  general: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).default([]),

  voting: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).default([]),

  submissions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).default([]),
}).default({});

// ============================================================================
// COMPLETE PROJECT CONFIG SCHEMA
// ============================================================================

/**
 * Complete project configuration schema
 * This matches the structure stored in projects.config (jsonb column)
 */
export const projectConfigSchema = z.object({
  features: featureFlagsSchema,
  ui: uiConfigSchema,
  businessRules: businessRulesSchema,
  automation: automationSchema,
  email: emailConfigSchema,
  metadata: projectMetadataSchema,
  seo: seoMetadataSchema,
  terminology: terminologySchema,
  content: z.object({
    pages: pageContentSchema,
    faq: faqContentSchema,
  }).default({ pages: {}, faq: {} }),
}).default({});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ProjectConfig = z.infer<typeof projectConfigSchema>;
export type FeatureFlags = z.infer<typeof featureFlagsSchema>;
export type UIConfig = z.infer<typeof uiConfigSchema>;
export type BusinessRules = z.infer<typeof businessRulesSchema>;
export type Automation = z.infer<typeof automationSchema>;
export type EmailConfig = z.infer<typeof emailConfigSchema>;
export type ProjectMetadata = z.infer<typeof projectMetadataSchema>;
export type SEOMetadata = z.infer<typeof seoMetadataSchema>;
export type Terminology = z.infer<typeof terminologySchema>;
export type PageContent = z.infer<typeof pageContentSchema>;
export type FAQContent = z.infer<typeof faqContentSchema>;
export type HowItWorks = z.infer<typeof howItWorksSchema>;
export type RoundInfoLabels = z.infer<typeof roundInfoLabelsSchema>;
export type SubmissionsGallery = z.infer<typeof submissionsGallerySchema>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate and parse project config with defaults
 */
export function validateProjectConfig(config: unknown): ProjectConfig {
  return projectConfigSchema.parse(config);
}

/**
 * Safely parse project config, returning defaults on error
 */
export function safeParseProjectConfig(config: unknown): ProjectConfig {
  const result = projectConfigSchema.safeParse(config);
  if (result.success) {
    return result.data;
  }
  console.warn("Invalid project config, using defaults:", result.error);
  return projectConfigSchema.parse({});
}

/**
 * Get default project config
 */
export function getDefaultProjectConfig(): ProjectConfig {
  return projectConfigSchema.parse({});
}
