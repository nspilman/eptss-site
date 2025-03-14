import { songs, roundMetadata, signUps } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type DBSong = InferSelectModel<typeof songs>;
export type DBRound = InferSelectModel<typeof roundMetadata>;

export type Phase = "signups" | "voting" | "covering" | "celebration";

export type DateLabel = {
  opens: string;
  closes: string;
};

export interface Submission {
  roundId: number;
  soundcloudUrl: string;
  username: string;
  createdAt: Date;
}

export interface RoundInfo {
  roundId: DBRound["id"];
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
  signups: { song: { title: string; artist: string; }; songId: number; youtubeLink: string; }[];
  // Add count properties
  signupCount?: number;
  submissionCount?: number;
}
