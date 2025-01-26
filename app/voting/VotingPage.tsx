"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormSubmission } from "@/hooks/useFormSubmission"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormWrapper } from "@/components/client/Forms/FormWrapper"
import { motion } from "framer-motion"
import { z } from "zod"
import { createInsertSchema } from "drizzle-zod"
import { songSelectionVotes } from "@/db/schema"
import { userParticipationProvider } from "@/providers"
import { FormReturn } from "@/types"
import { VoteOption } from "@/types/vote"
import { FormBuilder, FieldConfig } from "@/components/ui/form-fields/FormBuilder"
import { cn } from "@/lib/utils"

interface Props {
  roundId: number;
  hasVoted?: boolean;
  songs: VoteOption[];
  coveringStartLabel: string;
  userRoundDetails?: {
    hasSubmitted: boolean;
    hasVoted: boolean;
    hasSignedUp: boolean;
  };
}

// Create schema from votes table
const voteSchema = createInsertSchema(songSelectionVotes, {
  songId: z.number(),
  vote: z.number().min(1).max(5),
  roundId: z.number(),
})

type VoteInput = z.infer<typeof voteSchema>

function createVoteFields(songs: VoteOption[] = []): FieldConfig[] {
  return songs.map((song) => ({
    type: "radio",
    name: `song-${song.songId}`,
    label: `${song.song.title} by ${song.song.artist}`,
    description: "Rate from 1 to 5",
    options: [
      { label: "1", value: "1" },
      { label: "2", value: "2" },
      { label: "3", value: "3" },
      { label: "4", value: "4" },
      { label: "5", value: "5" },
    ],
    orientation: "horizontal",
    className: "p-4 rounded-lg bg-black/50 border border-gray-800 hover:border-gray-700 transition-colors",
  }));
}

export function VotingPage({
  roundId,
  hasVoted,
  songs = [],
  coveringStartLabel,
  userRoundDetails,
}: Props) {
  const form = useForm<VoteInput>({
    resolver: zodResolver(voteSchema),
    defaultValues: Object.fromEntries(
      songs.map(song => [`song-${song.songId}`, undefined])
    )
  })

  const onSubmit = async (formData: FormData): Promise<FormReturn> => {
    // Get the form values
    const formValues = form.getValues()
    console.log('Form values:', formValues)

    // Validate that all songs have been voted on
    const votes = Object.entries(formValues).map(([key, value]) => {
      const songId = key.replace('song-', '')
      return {
        songId,
        vote: value
      }
    })
    console.log('Votes:', votes)
    
    if (votes.some(vote => !vote.vote)) {
      return {
        status: "Error",
        message: "Please rate all songs before submitting",
      }
    }

    // Convert votes to the format expected by the API
    const newFormData = new FormData()
    for (const vote of votes) {
      newFormData.set(`song-${vote.songId}`, vote.vote!.toString())
    }
    newFormData.set('roundId', roundId.toString())

    const { submitVotes } = await userParticipationProvider()
    const result = await submitVotes(roundId, newFormData)
    return result
  }

  const { isLoading, handleSubmit } = useFormSubmission({
    onSubmit,
    form,
    successMessage: "Your votes have been recorded!",
  });

  if (userRoundDetails?.hasVoted || hasVoted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]">
          Thanks for voting!
        </h1>
        <div className="space-y-2 text-gray-300">
          <p>Your votes have been recorded for Round {roundId}.</p>
          <p>You&apos;ll receive an email soon with the details of which song won.</p>
        </div>
      </motion.div>
    )
  }

  if (!songs?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#e2e240] to-[#40e2e2]">
          No songs to vote on yet
        </h1>
        <div className="space-y-2 text-gray-300">
          <p>Please check back later when songs have been submitted.</p>
        </div>
      </motion.div>
    )
  }

  return (
    <FormWrapper
      title={`Vote for the songs you want to cover in Round ${roundId}`}
      description={
        <div className="space-y-2">
          <p>Rate each song from 1 to 5, where 5 means you&apos;d love to cover it!</p>
          <p className="text-sm text-gray-400">Covering starts {coveringStartLabel}</p>
        </div>
      }
      onSubmit={handleSubmit}
    >
      <Form {...form}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <input type="hidden" name="roundId" value={roundId} />
          <div className="space-y-4">
            {songs.map((song, index) => (
              <motion.div
                key={song.songId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <FormBuilder
                  fields={[createVoteFields([song])[0]]}
                  control={form.control}
                  disabled={isLoading}
                />
              </motion.div>
            ))}
          </div>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className={cn(
              "w-full bg-gradient-to-r from-[#e2e240] to-[#40e2e2] text-black font-bold",
              "hover:opacity-90 transition-opacity disabled:opacity-50"
            )}
          >
            {isLoading ? "Submitting votes..." : "Submit Votes"}
          </Button>
        </motion.div>
      </Form>
    </FormWrapper>
  )
}
