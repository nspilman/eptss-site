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
 * Page copy and descriptions per project
 */
export const pageContentSchema = z.object({
  home: z.object({
    hero: z.object({
      title: z.string().default("Welcome to EPTSS"),
      subtitle: z.string().default("Create and share music together"),
      cta: z.string().default("Get Started"),
    }).default({}),
    description: z.string().default("Join our music community"),
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
  email: emailConfigSchema,
  metadata: projectMetadataSchema,
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
export type EmailConfig = z.infer<typeof emailConfigSchema>;
export type ProjectMetadata = z.infer<typeof projectMetadataSchema>;
export type PageContent = z.infer<typeof pageContentSchema>;
export type FAQContent = z.infer<typeof faqContentSchema>;

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
