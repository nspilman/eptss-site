import { z } from "zod";
import { optionalPositiveNumber, urlOrEmpty } from "./zodHelpers";

// Define the submission schema directly as an object
export const submissionSchema = z.object({
  audioFileUrl: z.string({
    required_error: "Please upload an audio file",
    invalid_type_error: "Audio file URL must be a string",
  }).min(1, "Please upload an audio file").url("Audio File: Please provide a valid URL"),
  audioFilePath: z.string({
    required_error: "Please upload an audio file",
    invalid_type_error: "Audio file path must be a string",
  }).min(1, "Please upload an audio file"),
  coverImageUrl: urlOrEmpty(),
  coverImagePath: z.string().optional(),
  // Use shared helpers for optional positive numbers
  audioDuration: optionalPositiveNumber,
  audioFileSize: optionalPositiveNumber,
  // Lyrics field for original songs
  lyrics: z.string().optional(),
  coolThingsLearned: z.string().optional(),
  toolsUsed: z.string().optional(),
  happyAccidents: z.string().optional(),
  didntWork: z.string().optional(),
  // Use coerce for roundId to handle string to number conversion
  roundId: z.coerce.number().int().positive()
})

// Use the same schema for the form
export const submissionFormSchema = submissionSchema

// Use the client-side form schema for input validation
export type SubmissionInput = z.infer<typeof submissionFormSchema>
