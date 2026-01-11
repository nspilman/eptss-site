import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, integer, boolean, bigint, bigserial, pgEnum, index, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

// Users Table
export const users = pgTable("users", {
  userid: uuid("userid").primaryKey().notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  username: text("username").unique().notNull(),
  publicDisplayName: text("public_display_name"),
  adminLevel: integer("admin_level"),
  profilePictureUrl: text("profile_picture_url"),
});

// Songs Table
export const songs = pgTable("songs", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
});

// Round Metadata Table
export const roundMetadata = pgTable("round_metadata", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  slug: text("slug"),
  playlistUrl: text("playlist_url"),
  songId: bigint("song_id", { mode: "number" }).references(() => songs.id),
  createdAt: timestamp("created_at").defaultNow(),
  signupOpens: timestamp("signup_opens"),
  votingOpens: timestamp("voting_opens"),
  coveringBegins: timestamp("covering_begins"),
  coversDue: timestamp("covers_due"),
  listeningParty: timestamp("listening_party"),
//   roundTypeOverride: varchar()
}, (table) => ({
  projectSlugIdx: uniqueIndex("idx_round_metadata_project_slug").on(table.projectId, table.slug),
}));

// Round Prompts Table
export const roundPrompts = pgTable("round_prompts", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  roundId: bigint("round_id", { mode: "number" }).references(() => roundMetadata.id).notNull(),
  promptText: text("prompt_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RoundPrompt = typeof roundPrompts.$inferSelect;
export type NewRoundPrompt = typeof roundPrompts.$inferInsert;

// Sign-ups Table
export const signUps = pgTable("sign_ups", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  youtubeLink: text("youtube_link"),
  additionalComments: text("additional_comments"),
  roundId: bigint("round_id", { mode: "number" }).references(() => roundMetadata.id).notNull(),
  songId: bigint("song_id", { mode: "number" }).references(() => songs.id),
  userId: uuid("user_id").references(() => users.userid).notNull(),
});

// Unverified Sign-ups Table
export const unverifiedSignups = pgTable("unverified_signups", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  email: text("email").notNull(),
  songTitle: text("song_title"),
  artist: text("artist"),
  youtubeLink: text("youtube_link"),
  additionalComments: text("additional_comments"),
  roundId: bigint("round_id", { mode: "number" }).references(() => roundMetadata.id).notNull(),
  referralCode: text("referral_code"),
});

// Submissions Table
export const submissions = pgTable("submissions", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Legacy field for old SoundCloud submissions
  soundcloudUrl: text("soundcloud_url"),
  // New fields for uploaded audio files
  audioFileUrl: text("audio_file_url"),
  audioFilePath: text("audio_file_path"),
  coverImageUrl: text("cover_image_url"),
  coverImagePath: text("cover_image_path"),
  audioDuration: bigint("audio_duration", { mode: "number" }), // Stored in milliseconds for precision
  audioFileSize: integer("audio_file_size"),
  // Lyrics field for original songs project
  lyrics: text("lyrics"),
  roundId: bigint("round_id", { mode: "number" }).references(() => roundMetadata.id).notNull(),
  additionalComments: text("additional_comments"),
  userId: uuid("user_id").references(() => users.userid).notNull(),
});

// User Roles Table
export const userRoles = pgTable("user_roles", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: uuid("user_id").references(() => users.userid),
  adminLevel: integer("admin_level").notNull(),
});

// Song Selection Votes Table
export const songSelectionVotes = pgTable("song_selection_votes", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  songId: bigint("song_id", { mode: "number" }).references(() => songs.id),
  vote: integer("vote").notNull(),
  submitterEmail: text("submitter_email"),
  roundId: bigint("round_id", { mode: "number" }).references(() => roundMetadata.id),
  userId: uuid("user_id").references(() => users.userid),
});

// User Share Permissions Table
export const userSharePermissions = pgTable("user_share_permissions", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: uuid("user_id").references(() => users.userid, { onUpdate: "cascade", onDelete: "cascade" }),
  canShareBsky: boolean("can_share_bsky").notNull(),
});

// Mailing List Table
export const mailingList = pgTable('mailing_list', {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const mailingListUnsubscription = pgTable('mailing_list_unsubscription', {
  id: uuid().default(sql`gen_random_uuid()`),
  email: text('email').notNull().unique(),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Voting Candidate Overrides Table
export const votingCandidateOverrides = pgTable("round_voting_candidate_overrides", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  roundId: bigint("round_id", { mode: "number" }).references(() => roundMetadata.id).notNull(),
  originalRoundId: bigint("original_round_id", { mode: "number" }).references(() => roundMetadata.id).notNull(),
  songId: bigint("song_id", { mode: "number" }).references(() => songs.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const testRuns = pgTable("test_runs", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  testName: text("test_name").notNull(),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  duration: integer("duration"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  environment: text("environment").notNull(),
});

// Relations and types
// Feedback Type Enum
export const feedbackTypeEnum = pgEnum('feedback_type', ['review', 'bug_report', 'feature_request', 'general']);

// Media Type Enum
export const mediaTypeEnum = pgEnum('media_type', ['audio', 'video', 'image', 'embed']);

// Feedback Table
export const feedback = pgTable("feedback", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  type: feedbackTypeEnum("type").notNull(),
  content: text("content").notNull(),
  userId: uuid("user_id").references(() => users.userid),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isPublic: boolean("is_public").notNull().default(false),
});

// Reminder Email Type Enum
export const reminderEmailTypeEnum = pgEnum('reminder_email_type', [
  'voting_closes_tomorrow',
  'covering_halfway',
  'covering_one_month_left',
  'covering_last_week',
  'covers_due_tomorrow'
]);

// Notification Type Enum
export const notificationTypeEnum = pgEnum('notification_type', [
  'signup_confirmation',
  'vote_confirmation',
  'submission_confirmation',
  'round_opened',
  'round_voting_opened',
  'round_covering_begins',
  'round_covers_due',
  'comment_received',
  'comment_reply_received',
  'comment_upvoted',
  'mention_received',
  'admin_announcement',
  'survey_available',
  'test_notification'
]);

// Notification Email Type Enum
export const notificationEmailTypeEnum = pgEnum('notification_email_type', [
  'new_notifications',
  'outstanding_reminder'
]);

// Email Reminders Sent Table
export const emailRemindersSent = pgTable("email_reminders_sent", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  roundId: bigint("round_id", { mode: "number" }).references(() => roundMetadata.id).notNull(),
  userId: uuid("user_id").references(() => users.userid).notNull(),
  emailType: reminderEmailTypeEnum("email_type").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
});

// Notifications Table
export const notifications = pgTable("notifications", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  userId: uuid("user_id").references(() => users.userid, { onDelete: "cascade" }).notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  metadata: text("metadata"), // JSON string for additional data (roundId, songId, etc.)
  isRead: boolean("is_read").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  userIdReadIdx: index("notifications_user_read_idx").on(table.userId, table.isDeleted, table.isRead),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
}));

// Notification Emails Sent Table
export const notificationEmailsSent = pgTable("notification_emails_sent", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  userId: uuid("user_id").references(() => users.userid).notNull(),
  emailType: notificationEmailTypeEnum("email_type").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  notificationIds: text("notification_ids").array(),
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
});

// User Content Table (for reflections, blog posts, etc.)
export const userContent = pgTable("user_content", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  userId: uuid("user_id").references(() => users.userid).notNull(),
  roundId: bigint("round_id", { mode: "number" }).references(() => roundMetadata.id).notNull(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  markdownContent: text("markdown_content").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
});

// Tags Table
export const tags = pgTable("tags", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
  category: text("category"), // 'system', 'technical', 'creative', 'emotional', 'meta'
  isSystemTag: boolean("is_system_tag").notNull().default(false),
  useCount: integer("use_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Content Tags Junction Table
export const contentTags = pgTable("content_tags", {
  contentId: uuid("content_id").references(() => userContent.id, { onDelete: "cascade" }).notNull(),
  tagId: bigint("tag_id", { mode: "number" }).references(() => tags.id, { onDelete: "cascade" }).notNull(),
  addedBy: text("added_by").notNull(), // 'user' or 'system'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TestRun = typeof testRuns.$inferSelect;
export type NewTestRun = typeof testRuns.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
export type EmailReminderSent = typeof emailRemindersSent.$inferSelect;
export type NewEmailReminderSent = typeof emailRemindersSent.$inferInsert;
export type UserContent = typeof userContent.$inferSelect;
export type NewUserContent = typeof userContent.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type ContentTag = typeof contentTags.$inferSelect;
export type NewContentTag = typeof contentTags.$inferInsert;

// User Privacy Settings Table
export const userPrivacySettings = pgTable("user_privacy_settings", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  userId: uuid("user_id").references(() => users.userid, { onDelete: "cascade" }).notNull().unique(),
  showStats: boolean("show_stats").notNull().default(true),
  showSignups: boolean("show_signups").notNull().default(true),
  showSubmissions: boolean("show_submissions").notNull().default(true),
  showVotes: boolean("show_votes").notNull().default(false),
  showEmail: boolean("show_email").notNull().default(false),
  showSocialLinks: boolean("show_social_links").notNull().default(true),
  showEmbeddedMedia: boolean("show_embedded_media").notNull().default(true),
  notificationEmailsEnabled: boolean("notification_emails_enabled").notNull().default(true),
  profileBio: text("profile_bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserPrivacySettings = typeof userPrivacySettings.$inferSelect;
export type NewUserPrivacySettings = typeof userPrivacySettings.$inferInsert;

// User Social Links Table
export const userSocialLinks = pgTable("user_social_links", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  userId: uuid("user_id").references(() => users.userid, { onDelete: "cascade" }).notNull(),
  platform: text("platform").notNull(), // 'twitter', 'instagram', 'soundcloud', 'custom', etc.
  label: text("label"), // For custom links, display label
  url: text("url").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserSocialLink = typeof userSocialLinks.$inferSelect;
export type NewUserSocialLink = typeof userSocialLinks.$inferInsert;

// User Embedded Media Table
export const userEmbeddedMedia = pgTable("user_embedded_media", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  userId: uuid("user_id").references(() => users.userid, { onDelete: "cascade" }).notNull(),
  mediaType: mediaTypeEnum("media_type").notNull(),
  embedCode: text("embed_code").notNull(), // iframe code or URL
  title: text("title"), // Optional title/description
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UserEmbeddedMedia = typeof userEmbeddedMedia.$inferSelect;
export type NewUserEmbeddedMedia = typeof userEmbeddedMedia.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type NotificationEmailSent = typeof notificationEmailsSent.$inferSelect;
export type NewNotificationEmailSent = typeof notificationEmailsSent.$inferInsert;

// Comments Table
export const comments = pgTable("comments", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  userId: uuid("user_id").references(() => users.userid, { onDelete: "cascade" }).notNull(),
  parentCommentId: uuid("parent_comment_id").references((): any => comments.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isEdited: boolean("is_edited").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  parentCommentIdIdx: index("comments_parent_comment_id_idx").on(table.parentCommentId),
  userIdIdx: index("comments_user_id_idx").on(table.userId),
  createdAtIdx: index("comments_created_at_idx").on(table.createdAt),
}));

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

// Comment Associations Table - polymorphic relationship to different content types
export const commentAssociations = pgTable("comment_associations", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  commentId: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }).notNull(),
  // Exactly ONE of these should be non-null (enforced by CHECK constraint in migration)
  userContentId: uuid("user_content_id").references(() => userContent.id, { onDelete: "cascade" }),
  roundId: bigint("round_id", { mode: "number" }).references(() => roundMetadata.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  commentIdIdx: index("comment_associations_comment_id_idx").on(table.commentId),
  userContentIdIdx: index("comment_associations_user_content_id_idx").on(table.userContentId),
  roundIdIdx: index("comment_associations_round_id_idx").on(table.roundId),
}));

export type CommentAssociation = typeof commentAssociations.$inferSelect;
export type NewCommentAssociation = typeof commentAssociations.$inferInsert;

// Comment Upvotes Table
export const commentUpvotes = pgTable("comment_upvotes", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  commentId: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.userid, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  commentIdIdx: index("comment_upvotes_comment_id_idx").on(table.commentId),
  userIdIdx: index("comment_upvotes_user_id_idx").on(table.userId),
  // Composite index for checking if user upvoted a comment
  commentUserIdx: index("comment_upvotes_comment_user_idx").on(table.commentId, table.userId),
}));

export type CommentUpvote = typeof commentUpvotes.$inferSelect;
export type NewCommentUpvote = typeof commentUpvotes.$inferInsert;

// Bot Attempts Table
export const botAttempts = pgTable("bot_attempts", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  captchaScore: text("captcha_score"), // Stored as text to preserve decimal precision from reCAPTCHA API
  attemptType: text("attempt_type").notNull(), // 'signup', 'login', 'vote', etc.
  metadata: text("metadata"), // JSON string for additional context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BotAttempt = typeof botAttempts.$inferSelect;
export type NewBotAttempt = typeof botAttempts.$inferInsert;

// Referral Codes Table
export const referralCodes = pgTable("referral_codes", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  code: text("code").notNull().unique(),
  createdByUserId: uuid("created_by_user_id").references(() => users.userid, { onDelete: "cascade" }).notNull(),
  maxUses: integer("max_uses"), // NULL means unlimited uses
  usesCount: integer("uses_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ReferralCode = typeof referralCodes.$inferSelect;
export type NewReferralCode = typeof referralCodes.$inferInsert;

// User Referrals Table
export const userReferrals = pgTable("user_referrals", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  referredUserId: uuid("referred_user_id").references(() => users.userid, { onDelete: "cascade" }).notNull().unique(),
  referrerUserId: uuid("referrer_user_id").references(() => users.userid, { onDelete: "cascade" }).notNull(),
  referralCodeId: uuid("referral_code_id").references(() => referralCodes.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserReferral = typeof userReferrals.$inferSelect;
export type NewUserReferral = typeof userReferrals.$inferInsert;

// ============================================================================
// PROJECTS TABLE - Multi-project support
// ============================================================================

// Projects Table - stores project definitions (Cover, Original Songs, etc.)
export const projects = pgTable("projects", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  config: jsonb("config").notNull().default(sql`'{}'::jsonb`),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("idx_projects_slug").on(table.slug),
}));

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// Project IDs - fixed UUIDs for consistency across migrations
export const COVER_PROJECT_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
export const ORIGINAL_PROJECT_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

// ============================================================================
// PENDING UPLOADS TABLE - Track file uploads for cleanup
// ============================================================================

export const uploadStatusEnum = pgEnum('upload_status', ['pending', 'committed', 'failed']);

// Pending Uploads Table - tracks file uploads before DB commit
export const pendingUploads = pgTable("pending_uploads", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  bucket: text("bucket").notNull(), // The storage bucket name
  filePath: text("file_path").notNull(), // The file path within the bucket
  fileUrl: text("file_url"), // The public URL if available
  uploadedBy: uuid("uploaded_by").references(() => users.userid, { onDelete: "set null" }),
  status: uploadStatusEnum("status").notNull().default("pending"),
  relatedTable: text("related_table"), // e.g., 'submissions', for reference
  relatedId: text("related_id"), // The ID of the related record (stored as text for flexibility)
  metadata: jsonb("metadata"), // Additional context (roundId, userId, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  committedAt: timestamp("committed_at"),
  expiresAt: timestamp("expires_at").notNull(), // Auto-cleanup after this time if still pending
}, (table) => ({
  statusIdx: index("pending_uploads_status_idx").on(table.status),
  expiresAtIdx: index("pending_uploads_expires_at_idx").on(table.expiresAt),
  bucketPathIdx: index("pending_uploads_bucket_path_idx").on(table.bucket, table.filePath),
}));

export type PendingUpload = typeof pendingUploads.$inferSelect;
export type NewPendingUpload = typeof pendingUploads.$inferInsert;

// ============================================================================
// SURVEY SYSTEM TABLES - User feedback collection
// ============================================================================

// Survey Templates Table - reusable survey definitions
export const surveyTemplates = pgTable("survey_templates", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by").references(() => users.userid, { onDelete: "set null" }),
  questions: jsonb("questions").notNull(), // Array of question objects
  isActive: boolean("is_active").notNull().default(true),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index("survey_templates_project_id_idx").on(table.projectId),
  isActiveIdx: index("survey_templates_is_active_idx").on(table.isActive, table.isDeleted),
}));

export type SurveyTemplate = typeof surveyTemplates.$inferSelect;
export type NewSurveyTemplate = typeof surveyTemplates.$inferInsert;

// Survey Target Audience Enum
export const surveyTargetAudienceEnum = pgEnum('survey_target_audience', ['submitters', 'signups', 'all_project_members']);

// Survey Instance Status Enum
export const surveyInstanceStatusEnum = pgEnum('survey_instance_status', ['scheduled', 'active', 'completed', 'cancelled']);

// Survey Instances Table - links surveys to specific rounds
export const surveyInstances = pgTable("survey_instances", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  templateId: uuid("template_id").references(() => surveyTemplates.id, { onDelete: "cascade" }).notNull(),
  roundId: bigint("round_id", { mode: "number" }).references(() => roundMetadata.id, { onDelete: "cascade" }).notNull(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  status: surveyInstanceStatusEnum("status").notNull().default("scheduled"),
  targetAudience: surveyTargetAudienceEnum("target_audience").notNull(),
  triggerDate: timestamp("trigger_date").notNull(), // When survey becomes available
  expiresAt: timestamp("expires_at"), // Optional expiration date
  notificationsSent: boolean("notifications_sent").notNull().default(false),
  notificationsSentAt: timestamp("notifications_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  roundIdIdx: index("survey_instances_round_id_idx").on(table.roundId),
  projectIdIdx: index("survey_instances_project_id_idx").on(table.projectId),
  statusIdx: index("survey_instances_status_idx").on(table.status),
  triggerDateIdx: index("survey_instances_trigger_date_idx").on(table.triggerDate),
}));

export type SurveyInstance = typeof surveyInstances.$inferSelect;
export type NewSurveyInstance = typeof surveyInstances.$inferInsert;

// Survey Responses Table - stores user submissions
export const surveyResponses = pgTable("survey_responses", {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  instanceId: uuid("instance_id").references(() => surveyInstances.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.userid, { onDelete: "cascade" }).notNull(),
  roundId: bigint("round_id", { mode: "number" }).references(() => roundMetadata.id, { onDelete: "cascade" }).notNull(),
  answers: jsonb("answers").notNull(), // Object mapping question IDs to answers
  isComplete: boolean("is_complete").notNull().default(false),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  submittedAt: timestamp("submitted_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  instanceIdIdx: index("survey_responses_instance_id_idx").on(table.instanceId),
  userIdIdx: index("survey_responses_user_id_idx").on(table.userId),
  roundIdIdx: index("survey_responses_round_id_idx").on(table.roundId),
  // Composite index for fast lookups of user's response to a specific survey
  instanceUserIdx: uniqueIndex("survey_responses_instance_user_idx").on(table.instanceId, table.userId),
}));

export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type NewSurveyResponse = typeof surveyResponses.$inferInsert;
