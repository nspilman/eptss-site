/**
 * Types related to user signups
 */

/**
 * Base interface for song data
 */
export interface SongData {
  title: string;
  artist: string;
}

/**
 * Interface for signup data as stored in the database and used in the API
 */
export interface SignupData {
  songId: number | null;
  youtubeLink: string | null;
  userId: string;
  email: string;
  song: SongData;
  additionalComments?: string;
  // User profile fields
  username?: string;
  publicDisplayName?: string | null;
  profilePictureUrl?: string | null;
}

/**
 * Interface for user signup data displayed in the UI
 */
export interface UserSignupData {
  songTitle?: string;
  artist?: string;
  youtubeLink?: string;
  additionalComments?: string | undefined;
}

/**
 * Interface for signup form values
 */
export interface SignupFormValues {
  songTitle: string;
  artist: string;
  youtubeLink: string;
  additionalComments?: string;
  roundId: number;
}

/**
 * Interface for non-logged in signup form values
 */
export interface NonLoggedInSignupFormValues extends SignupFormValues {
  email: string;
  name: string;
  location?: string;
}
