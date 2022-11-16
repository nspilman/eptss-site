export enum FormField {
  Email = "email",
  Name = "name",
  SongTitle = "songTitle",
  Artist = "artist",
  YoutubeLink = "youtubeLink",
  AdditionalComments = "additionalComments",
}

export interface SignupModel {
  createdAt: string;
  email: string;
  name: string;
  songTitle: string;
  artist: string;
  youtubeLink: string;
  additionalComments: string;
}

export interface SignupEntity
  extends Pick<SignupModel, "name" | "email" | "artist"> {
  created_at: string;
  song_title: string;
  youtube_link: string;
  round_id: number;
  additional_comments: string;
}
