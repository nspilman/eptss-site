import { z } from "zod"
import { createInsertSchema } from "drizzle-zod"
import { submissions } from "@/db/schema"

const baseSubmissionSchema = createInsertSchema(submissions, {
  soundcloudUrl: z.string().url("Please enter a valid Soundcloud URL"),
})

export const submissionSchema = baseSubmissionSchema.extend({
  coolThingsLearned: z.string().optional(),
  toolsUsed: z.string().optional(),
  happyAccidents: z.string().optional(),
  didntWork: z.string().optional(),
  roundId: z.number()
})

export type SubmissionInput = z.infer<typeof submissionSchema>
