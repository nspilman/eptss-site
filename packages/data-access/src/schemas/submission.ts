import { z } from "zod"

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
  coverImageUrl: z.union([z.string().url(), z.literal("")]).optional(),
  coverImagePath: z.string().optional(),
  // Use preprocess to handle string to number conversion from FormData
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
  // Use coerce for roundId to handle string to number conversion
  roundId: z.coerce.number().int().positive()
})

// Use the same schema for the form
export const submissionFormSchema = submissionSchema

// Use the client-side form schema for input validation
export type SubmissionInput = z.infer<typeof submissionFormSchema>
