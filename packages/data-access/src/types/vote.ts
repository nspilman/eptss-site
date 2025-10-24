export type VoteOption = {
  roundId: number;
  originalRoundId?: number;
  songId: number;
  youtubeLink?: string;
  song: {
    title: string;
    artist: string;
  }
};
