// Define the vote type from the database
export type VoteRow = {
  id: number;
  created_at: string;
  vote: number;
  round_slug: string;
  song_id: number;
  user_id: string;
  submitter_email: string | null;
};

// Define the GroupedVote type for the profile page
export type GroupedVote = {
  round_slug: string;
  count: number;
  latest_vote_date: string | null;
  votes: VoteRow[];
};

// Define simplified round metadata type with only the fields we need
export type RoundMetadataSubset = {
  id: number;
  slug: string | null;
  signup_opens: string | null;
  covering_begins: string | null;
  covers_due: string | null;
};

export type SignupItem = {
  id: number;
  created_at: string | null;
  youtube_link: string | null;
  song_id: number | null;
  user_id: string;
  additional_comments: string | null;
  title: string;
  artist: string;
};

// Grouped signups by round
export type GroupedSignup = {
  round_id: number;
  round_slug: string | null;
  signup_count: number;
  latest_signup_date: string | null;
  signups: SignupItem[];
  round_metadata: RoundMetadataSubset | null;
};

// For backward compatibility
export type Signup = GroupedSignup;

// Custom type for submissions
// Supports both legacy SoundCloud submissions and new uploaded audio files
export type Submission = {
  id: number;
  created_at: string | null;
  title: string | null;
  artist: string | null;
  // Legacy field for old SoundCloud submissions
  soundcloud_url?: string | null;
  // New fields for uploaded audio
  audio_file_url?: string | null;
  cover_image_url?: string | null;
  audio_duration?: number | null;
  audio_file_size?: number | null;
  round_slug: string | null;
  user_id: string | null;
  additional_comments: string | null;
  round_metadata: RoundMetadataSubset | null;
};
