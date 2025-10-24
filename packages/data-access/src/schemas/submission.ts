import { z } from "zod"

// Define the submission schema directly as an object
export const submissionSchema = z.object({
  soundcloudUrl: z.string().url("Please enter a valid Soundcloud URL"),
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
