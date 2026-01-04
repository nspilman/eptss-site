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
  audioFileUrl: z.string().url("Invalid audio file URL"),
  audioFilePath: z.string().min(1, "Audio file path is required"),
  coverImageUrl: z.union([z.string().url(), z.literal("")]).optional(),
  coverImagePath: z.string().optional(),
  // Use preprocess to handle string to number conversion for optional fields
  audioDuration: z.preprocess(
    (val) => {
      if (val === undefined || val === "" || val === null) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().positive().optional()
  ),
  audioFileSize: z.preprocess(
    (val) => {
      if (val === undefined || val === "" || val === null) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    },
    z.number().positive().optional()
  ),
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
