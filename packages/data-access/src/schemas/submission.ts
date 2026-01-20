import { z } from "zod";
import { optionalPositiveNumber } from "./zodHelpers";

// Form schema for client-side validation (text fields only)
// Media fields are validated by canSubmit() using reducer state
// This avoids async timing issues with form.setValue()
export const submissionFormSchema = z.object({
  // Media fields are optional here - validated separately via canSubmit()
  audioFileUrl: z.string().optional(),
  audioFilePath: z.string().optional(),
  coverImageUrl: z.string().optional(),
  coverImagePath: z.string().optional(),
  audioDuration: optionalPositiveNumber,
  audioFileSize: optionalPositiveNumber,
  // Text fields
  lyrics: z.string().optional(),
  coolThingsLearned: z.string().optional(),
  toolsUsed: z.string().optional(),
  happyAccidents: z.string().optional(),
  didntWork: z.string().optional(),
  roundId: z.coerce.number().int().positive()
})

// Type for form input (what react-hook-form manages)
export type SubmissionInput = z.infer<typeof submissionFormSchema>
