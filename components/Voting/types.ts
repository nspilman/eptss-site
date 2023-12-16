export interface VoteOptionModel {
  label: string;
  field: string;
  link: string;
}

export interface VoteOptionEntity {
  song: {
    title: string;
    artist: string;
  };
  song_id: number;
  round_id: string;
  youtube_link?: string;
}
