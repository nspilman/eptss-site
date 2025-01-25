import { pgTable, foreignKey, bigint, timestamp, uuid, boolean, unique, text, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const userSharePermissions = pgTable("user_share_permissions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	userId: uuid("user_id"),
	canShareBsky: boolean("can_share_bsky").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userid],
			name: "user_share_permissions_user_id_users_userid_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const users = pgTable("users", {
	userid: uuid().primaryKey().notNull(),
	email: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	username: text(),
	adminLevel: integer("admin_level"),
}, (table) => [
	unique("users_email_unique").on(table.email),
	unique("users_username_unique").on(table.username),
]);

export const mailingListUnsubscription = pgTable("mailing_list_unsubscription", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	email: text().notNull(),
	userId: uuid("user_id").notNull(),
}, (table) => [
	unique("mailing_list_unsubscription_email_unique").on(table.email),
]);

export const userRoles = pgTable("user_roles", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	userId: uuid("user_id"),
	adminLevel: integer("admin_level").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userid],
			name: "user_roles_user_id_users_userid_fk"
		}),
]);

export const roundVotingCandidateOverrides = pgTable("round_voting_candidate_overrides", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roundId: bigint("round_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	songId: bigint("song_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	originalRoundId: bigint("original_round_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.originalRoundId],
			foreignColumns: [roundMetadata.id],
			name: "round_voting_candidate_overrides_original_round_id_round_metada"
		}),
	foreignKey({
			columns: [table.roundId],
			foreignColumns: [roundMetadata.id],
			name: "round_voting_candidate_overrides_round_id_round_metadata_id_fk"
		}),
	foreignKey({
			columns: [table.songId],
			foreignColumns: [songs.id],
			name: "round_voting_candidate_overrides_song_id_songs_id_fk"
		}),
]);

export const roundMetadata = pgTable("round_metadata", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	playlistUrl: text("playlist_url"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	songId: bigint("song_id", { mode: "number" }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	signupOpens: timestamp("signup_opens", { mode: 'string' }),
	votingOpens: timestamp("voting_opens", { mode: 'string' }),
	coveringBegins: timestamp("covering_begins", { mode: 'string' }),
	coversDue: timestamp("covers_due", { mode: 'string' }),
	listeningParty: timestamp("listening_party", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.songId],
			foreignColumns: [songs.id],
			name: "round_metadata_song_id_songs_id_fk"
		}),
]);

export const signUps = pgTable("sign_ups", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	youtubeLink: text("youtube_link").notNull(),
	additionalComments: text("additional_comments"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roundId: bigint("round_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	songId: bigint("song_id", { mode: "number" }),
	userId: uuid("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.roundId],
			foreignColumns: [roundMetadata.id],
			name: "sign_ups_round_id_round_metadata_id_fk"
		}),
	foreignKey({
			columns: [table.songId],
			foreignColumns: [songs.id],
			name: "sign_ups_song_id_songs_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userid],
			name: "sign_ups_user_id_users_userid_fk"
		}),
]);

export const songSelectionVotes = pgTable("song_selection_votes", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	songId: bigint("song_id", { mode: "number" }),
	vote: integer().notNull(),
	submitterEmail: text("submitter_email"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roundId: bigint("round_id", { mode: "number" }),
	userId: uuid("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.roundId],
			foreignColumns: [roundMetadata.id],
			name: "song_selection_votes_round_id_round_metadata_id_fk"
		}),
	foreignKey({
			columns: [table.songId],
			foreignColumns: [songs.id],
			name: "song_selection_votes_song_id_songs_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userid],
			name: "song_selection_votes_user_id_users_userid_fk"
		}),
]);

export const songs = pgTable("songs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	title: text().notNull(),
	artist: text().notNull(),
});

export const submissions = pgTable("submissions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	soundcloudUrl: text("soundcloud_url").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	roundId: bigint("round_id", { mode: "number" }),
	additionalComments: text("additional_comments"),
	userId: uuid("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.roundId],
			foreignColumns: [roundMetadata.id],
			name: "submissions_round_id_round_metadata_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.userid],
			name: "submissions_user_id_users_userid_fk"
		}),
]);

export const mailingList = pgTable("mailing_list", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	name: text().notNull(),
	email: text().notNull(),
}, (table) => [
	unique("mailing_list_email_unique").on(table.email),
]);
