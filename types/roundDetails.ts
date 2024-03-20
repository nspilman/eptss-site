export interface RoundDetails {
  playlist: string;
  roundId: number;
  title: string;
  artist: string;
}

export interface UserRoundDetails {
  user: {
    userid: any;
    song_selection_votes: {
      round_id: any;
      created_at: any;
    }[];
    submissions: {
      round_id: any;
      created_at: any;
    }[];
    sign_ups: {
      round_id: any;
      created_at: any;
    }[];
  };
  hasVoted: boolean;
  hasSubmitted: boolean;
  hasSignedUp: boolean;
}
