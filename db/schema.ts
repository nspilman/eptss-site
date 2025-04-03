import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, integer, boolean, bigint, bigserial } from "drizzle-orm/pg-core";

// Users Table
export const users = pgTable("users", {
  userid: uuid("userid").primaryKey().notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  username: text("username").unique().notNull(),
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
export type TestRun = typeof testRuns.$inferSelect;
export type NewTestRun = typeof testRuns.$inferInsert;
