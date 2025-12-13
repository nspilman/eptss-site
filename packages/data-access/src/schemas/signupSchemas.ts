import { z } from "zod";

// Song fields (used when requireSongOnSignup is true)
const songFields = {
  songTitle: z.string().min(1, "Song title is required"),
  artist: z.string().min(1, "Artist is required"),
  youtubeLink: z.string().min(1, "Youtube link is required")
    .regex(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/, "Must be a valid YouTube URL"),
};

// Optional song fields (used when requireSongOnSignup is false)
const optionalSongFields = {
  songTitle: z.string().optional(),
  artist: z.string().optional(),
  youtubeLink: z.string().optional(),
};

// Common fields for all signup forms
const commonFields = {
  additionalComments: z.string().optional(),
  roundId: z.number(),
};

// Base schema with song required
const baseSignupSchemaWithSong = {
  ...songFields,
  ...commonFields,
};

// Base schema without song required
const baseSignupSchemaWithoutSong = {
  ...optionalSongFields,
  ...commonFields,
};

// Schema for logged in users (with song required - default)
export const signupSchema = z.object(baseSignupSchemaWithSong);

// Schema for logged in users (without song required)
export const signupSchemaNoSong = z.object(baseSignupSchemaWithoutSong);

// Schema for non-logged in users with additional fields (with song required - default)
export const nonLoggedInSchema = z.object({
  ...baseSignupSchemaWithSong,
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
  referralCode: z.string().min(1, "A referral code is required. Please ask an existing member for an invite link."),
});

// Schema for non-logged in users (without song required)
export const nonLoggedInSchemaNoSong = z.object({
  ...baseSignupSchemaWithoutSong,
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
  referralCode: z.string().min(1, "A referral code is required. Please ask an existing member for an invite link."),
});

// Type definitions derived from schemas
export type SignupFormValues = z.infer<typeof signupSchema>;
export type NonLoggedInSignupFormValues = z.infer<typeof nonLoggedInSchema>;
