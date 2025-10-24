import { z } from "zod";

/**
 * Validation schemas for Server Actions
 */

// Dashboard Actions
export const signupForRoundSchema = z.object({
  roundId: z.coerce.number().int().positive("Round ID must be a positive number"),
  userId: z.string().uuid("Invalid user ID format"),
});

// User Participation Actions
export const submitVotesSchema = z.object({
  roundId: z.coerce.number().int().positive("Round ID must be a positive number"),
  // Votes are validated dynamically in the action
});

export const submitCoverSchema = z.object({
  roundId: z.coerce.number().int().positive("Round ID must be a positive number"),
  soundcloudUrl: z.string().url("Invalid SoundCloud URL"),
  coolThingsLearned: z.string().optional(),
  toolsUsed: z.string().optional(),
  happyAccidents: z.string().optional(),
  didntWork: z.string().optional(),
});

export const signupWithSongSchema = z.object({
  roundId: z.coerce.number().int().positive("Round ID must be a positive number"),
  songTitle: z.string().min(1, "Song title is required"),
  artist: z.string().min(1, "Artist name is required"),
  youtubeLink: z.string().url("Invalid YouTube URL"),
  additionalComments: z.string().optional(),
});

export const signupWithOTPSchema = z.object({
  roundId: z.coerce.number().int().positive("Round ID must be a positive number"),
  email: z.string().email("Invalid email address"),
  songTitle: z.string().min(1, "Song title is required"),
  artist: z.string().min(1, "Artist name is required"),
  youtubeLink: z.string().url("Invalid YouTube URL"),
});

// Export for use in other schemas
export type SignupWithOTPInput = z.infer<typeof signupWithOTPSchema>;
