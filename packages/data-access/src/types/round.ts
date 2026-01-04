import { songs, roundMetadata, signUps } from "../db/schema";
import { InferSelectModel } from "drizzle-orm";
import { SignupData } from "./signup";

export type DBSong = InferSelectModel<typeof songs>;
export type DBRound = InferSelectModel<typeof roundMetadata>;

export type Phase = "signups" | "voting" | "covering" | "celebration";

export type DateLabel = {
  opens: string;
  closes: string;
};

/**
 * Shared audio file fields used across submission types
 * For new submissions (uploaded to our buckets)
 */
export interface AudioFileFields {
  audioFileUrl: string;
  coverImageUrl: string | null;
  audioDuration: number | null;
  audioFileSize: number | null;
}

/**
 * Submission type for round provider
 * Supports both legacy SoundCloud URLs and new audio file uploads
 */
export interface Submission {
  roundId: number;
  username: string;
  userId: string;
  createdAt: Date;
  // Legacy field for old submissions
  soundcloudUrl?: string | null;
  // New fields for uploaded audio
  audioFileUrl?: string | null;
  coverImageUrl?: string | null;
  audioDuration?: number | null;
  audioFileSize?: number | null;
}

// SignupData is now imported from ./signup

export interface RoundInfo {
  roundId: DBRound["id"];
  slug: string;
  phase: Phase;
  song: Pick<DBSong, "title" | "artist">;
  dateLabels: Record<Phase, DateLabel>;
  hasRoundStarted: boolean;
  areSubmissionsOpen: boolean;
  isVotingOpen: boolean;
  voteOptions: Array<{
    roundId: number;
    songId: number;
    youtubeLink?: string;
    song: Pick<DBSong, "title" | "artist">;
  }>;
  submissions: Submission[];
  playlistUrl?: string;
  signups: SignupData[];
  // Add count properties
  signupCount?: number;
  submissionCount?: number;
  // Raw date objects for reflection scheduling
  signupOpens: Date;
  votingOpens: Date;
  coveringBegins: Date;
  coversDue: Date;
  listeningParty: Date;
  // Project features
  votingEnabled: boolean;
}
