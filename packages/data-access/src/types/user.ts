import { users, submissions, signUps, songSelectionVotes } from "../db/schema";
import { InferSelectModel } from "drizzle-orm";

// Base types from database schema
export type DBUser = InferSelectModel<typeof users>;
export type DBSubmission = InferSelectModel<typeof submissions>;
export type DBSignUp = InferSelectModel<typeof signUps>;
export type DBVote = InferSelectModel<typeof songSelectionVotes>;

// User participation details
export interface UserRoundParticipation {
  user: Pick<DBUser, "userid" | "email">;
  hasVoted: boolean;
  hasSubmitted: boolean;
  hasSignedUp: boolean;
}

// Extended user details with round participation
export interface UserDetails extends Pick<DBUser, "userid" | "email" | "username"> {
  adminLevel?: DBUser["adminLevel"];
  roundParticipation?: UserRoundParticipation;
}
