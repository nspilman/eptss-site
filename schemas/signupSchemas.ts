import { z } from "zod";

// Base schema with common fields for all signup forms
export const baseSignupSchema = {
  songTitle: z.string().min(1, "Song title is required"),
  artist: z.string().min(1, "Artist is required"),
  youtubeLink: z.string().min(1, "Youtube link is required")
    .regex(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/, "Must be a valid YouTube URL"),
  additionalComments: z.string().optional(),
  roundId: z.number(),
};

// Schema for logged in users (just the base schema)
export const signupSchema = z.object(baseSignupSchema);

// Schema for non-logged in users with additional fields
export const nonLoggedInSchema = z.object({
  ...baseSignupSchema,
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
});

// Type definitions derived from schemas
export type SignupFormValues = z.infer<typeof signupSchema>;
export type NonLoggedInSignupFormValues = z.infer<typeof nonLoggedInSchema>;
