import { z } from "zod"

// Define the submission schema directly as an object
export const submissionSchema = z.object({
  audioFileUrl: z.string().url("Please provide a valid audio file URL"),
  audioFilePath: z.string().min(1, "Audio file path is required"),
  coverImageUrl: z.string().url().optional(),
  coverImagePath: z.string().optional(),
  audioDuration: z.number().positive().optional(),
  audioFileSize: z.number().positive().optional(),
  coolThingsLearned: z.string().optional(),
  toolsUsed: z.string().optional(),
  happyAccidents: z.string().optional(),
  didntWork: z.string().optional(),
  roundId: z.number()
})

// Use the same schema for the form
export const submissionFormSchema = submissionSchema

// Use the client-side form schema for input validation
export type SubmissionInput = z.infer<typeof submissionFormSchema>
