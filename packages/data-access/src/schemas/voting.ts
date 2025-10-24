import { z } from "zod"
import { createInsertSchema } from "drizzle-zod"
import { songSelectionVotes } from "../db/schema"

const baseVotingSchema = createInsertSchema(songSelectionVotes, {
  vote: z.number().min(1).max(5).describe("Vote must be between 1 and 5"),
})

export const votingSchema = baseVotingSchema.extend({
  // Add any additional fields if needed
})

export type VotingInput = z.infer<typeof votingSchema>
