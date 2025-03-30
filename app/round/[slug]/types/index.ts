export interface VoteResults {
  title: string;
  artist: string;
  average: number;
}

export interface SignupData {
  youtube_link: string;
  title: string;
  artist: string;
}

export interface Navigation {
  next?: number;
  previous?: number;
}

export interface RoundMetadata {
  artist: string;
  title: string;
  playlistUrl: string;
  submitter: string;
}

export interface VoteBreakdown {
  title: string;
  artist: string;
  oneCount: number;
  twoCount: number;
  threeCount: number;
  fourCount: number;
  fiveCount: number;
}
