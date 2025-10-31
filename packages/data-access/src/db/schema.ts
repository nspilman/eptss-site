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
