export interface SignupModel {
  createdAt: string;
  email: string;
  name: string;
  songTitle: string;
  artist: string;
  youtubeLink: string;
  additionalComments: string;
}

export interface SignupEntity extends Pick<SignupModel, "name" | "email"> {
  artist_name: string;
  created_at: string;
  song_title: string;
  youtube_link: string;
  round_id: number;
  additional_comments: string;
}
