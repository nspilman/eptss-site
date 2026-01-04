/**
 * Storage Service - Constants and Helper Functions
 * This file contains non-async utilities and constants
 */

export const BUCKETS = {
  PROFILE_PICTURES: "profile-pictures",
  AUDIO_SUBMISSIONS: "audio-submissions",
  SUBMISSION_IMAGES: "submission-images",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

/**
 * Generate a unique file path for a user's profile picture
 * @param userId - The user ID
 * @param fileName - Original file name
 * @returns A unique file path
 */
export function generateProfilePicturePath(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const extension = fileName.split('.').pop() || 'jpg';
  return `${userId}/${timestamp}.${extension}`;
}
