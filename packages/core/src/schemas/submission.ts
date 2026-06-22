import { z } from "zod";

// Client-side form schema for the submission form. Every submission is a plyr track:
// the user pastes a plyr.fm track link (resolved server-side to the fm.plyr.track in
// their repo) plus a short public caption; the rest is narrative text kept in Postgres.
export const submissionFormSchema = z.object({
  // The deliverable: a plyr.fm track URL. The server resolves it to the fm.plyr.track
  // in the user's repo and writes the at.atjam.submission with that record as payload.
  plyrTrackUrl: z.string().optional(),
  // Short public caption written onto the at.atjam.submission record (≤300 graphemes).
  // The long-form reflection prompts below stay in Postgres.
  note: z.string().optional(),
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
