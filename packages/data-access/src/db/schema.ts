import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, integer, boolean, bigint, bigserial, pgEnum } from "drizzle-orm/pg-core";

// Users Table
export const users = pgTable("users", {
  userid: uuid("userid").primaryKey().notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  username: text("username").unique().notNull(),
  fullName: text("full_name"),
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
  slug: text("slug").unique(),
  playlistUrl: text("playlist_url"),
  songId: bigint("song_id", { mode: "number" }).references(() => songs.id),
  createdAt: timestamp("created_at").defaultNow(),
  signupOpens: timestamp("signup_opens"),
  votingOpens: timestamp("voting_opens"),
  coveringBegins: timestamp("covering_begins"),
  coversDue: timestamp("covers_due"),
  listeningParty: timestamp("listening_party"),
//   roundTypeOverride: varchar()
});

// Sign-ups Table
export const signUps = pgTable("sign_ups", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  youtubeLink: text("youtube_link").notNull(),
  additionalComments: text("additional_comments"),
  roundId: bigint("round_id", { mode: "number" }).references(() => roundMetadata.id).notNull(),
  songId: bigint("song_id", { mode: "number" }).references(() => songs.id).notNull(),
  userId: uuid("user_id").references(() => users.userid).notNull(),
});

// Unverified Sign-ups Table
export const unverifiedSignups = pgTable("unverified_signups", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow(),
  email: text("email").notNull(),
  songTitle: text("song_title").notNull(),
  artist: text("artist").notNull(),
  youtubeLink: text("youtube_link").notNull(),
  additionalComments: text("additional_comments"),
  roundId: bigint("round_id", { mode: "number" }).references(() => roundMetadata.id).notNull(),
});

// Submissions Table
export const submissions = pgTable("submissions", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  soundcloudUrl: text("soundcloud_url").notNull(),
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
  'test_notification'
]);

// Email Reminders Sent Table
export const emailRemindersSent = pgTable("email_reminders_sent", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
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
  publicDisplayName: text("public_display_name"),
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

// Comments Table
export const comments = pgTable("comments", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  contentId: uuid("content_id").references(() => userContent.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.userid, { onDelete: "cascade" }).notNull(),
  parentCommentId: uuid("parent_comment_id").references((): any => comments.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isEdited: boolean("is_edited").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

// Comment Upvotes Table
export const commentUpvotes = pgTable("comment_upvotes", {
  id: uuid().default(sql`gen_random_uuid()`).primaryKey(),
  commentId: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.userid, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CommentUpvote = typeof commentUpvotes.$inferSelect;
export type NewCommentUpvote = typeof commentUpvotes.$inferInsert;
