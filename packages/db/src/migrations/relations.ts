import { relations } from "drizzle-orm/relations";
import { users, userSharePermissions, userRoles, roundMetadata, roundVotingCandidateOverrides, songs, signUps, songSelectionVotes, submissions } from "./schema";

export const userSharePermissionsRelations = relations(userSharePermissions, ({one}) => ({
	user: one(users, {
		fields: [userSharePermissions.userId],
		references: [users.userid]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	userSharePermissions: many(userSharePermissions),
	userRoles: many(userRoles),
	signUps: many(signUps),
	songSelectionVotes: many(songSelectionVotes),
	submissions: many(submissions),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.userid]
	}),
}));

export const roundVotingCandidateOverridesRelations = relations(roundVotingCandidateOverrides, ({one}) => ({
	roundMetadatum_originalRoundId: one(roundMetadata, {
		fields: [roundVotingCandidateOverrides.originalRoundId],
		references: [roundMetadata.id],
		relationName: "roundVotingCandidateOverrides_originalRoundId_roundMetadata_id"
	}),
	roundMetadatum_roundId: one(roundMetadata, {
		fields: [roundVotingCandidateOverrides.roundId],
		references: [roundMetadata.id],
		relationName: "roundVotingCandidateOverrides_roundId_roundMetadata_id"
	}),
	song: one(songs, {
		fields: [roundVotingCandidateOverrides.songId],
		references: [songs.id]
	}),
}));

export const roundMetadataRelations = relations(roundMetadata, ({one, many}) => ({
	roundVotingCandidateOverrides_originalRoundId: many(roundVotingCandidateOverrides, {
		relationName: "roundVotingCandidateOverrides_originalRoundId_roundMetadata_id"
	}),
	roundVotingCandidateOverrides_roundId: many(roundVotingCandidateOverrides, {
		relationName: "roundVotingCandidateOverrides_roundId_roundMetadata_id"
	}),
	song: one(songs, {
		fields: [roundMetadata.songId],
		references: [songs.id]
	}),
	signUps: many(signUps),
	songSelectionVotes: many(songSelectionVotes),
	submissions: many(submissions),
}));

export const songsRelations = relations(songs, ({many}) => ({
	roundVotingCandidateOverrides: many(roundVotingCandidateOverrides),
	roundMetadata: many(roundMetadata),
	signUps: many(signUps),
	songSelectionVotes: many(songSelectionVotes),
}));

export const signUpsRelations = relations(signUps, ({one}) => ({
	roundMetadatum: one(roundMetadata, {
		fields: [signUps.roundId],
		references: [roundMetadata.id]
	}),
	song: one(songs, {
		fields: [signUps.songId],
		references: [songs.id]
	}),
	user: one(users, {
		fields: [signUps.userId],
		references: [users.userid]
	}),
}));

export const songSelectionVotesRelations = relations(songSelectionVotes, ({one}) => ({
	roundMetadatum: one(roundMetadata, {
		fields: [songSelectionVotes.roundId],
		references: [roundMetadata.id]
	}),
	song: one(songs, {
		fields: [songSelectionVotes.songId],
		references: [songs.id]
	}),
	user: one(users, {
		fields: [songSelectionVotes.userId],
		references: [users.userid]
	}),
}));

export const submissionsRelations = relations(submissions, ({one}) => ({
	roundMetadatum: one(roundMetadata, {
		fields: [submissions.roundId],
		references: [roundMetadata.id]
	}),
	user: one(users, {
		fields: [submissions.userId],
		references: [users.userid]
	}),
}));