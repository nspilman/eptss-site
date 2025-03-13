"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormSubmission } from "@/hooks/useFormSubmission"
import { Button, Form } from "@/components/ui/primitives"
import { FormWrapper } from "@/components/client/Forms/FormWrapper"
import { motion } from "framer-motion"
import { z } from "zod"
import { createInsertSchema } from "drizzle-zod"
import { signUps, songs } from "@/db/schema"
import { userParticipationProvider } from "@/providers"
import { FormReturn } from "@/types"
import { FormBuilder, FieldConfig } from "@/components/ui/form-fields/FormBuilder"

// Create schema from songs table
const songSchema = createInsertSchema(songs, {
  title: z.string().min(1, "Song title is required"),
  artist: z.string().min(1, "Artist is required"),
}).pick({
  title: true,
  artist: true,
})

// Create schema from signUps table and merge with song schema
const signupSchema = createInsertSchema(signUps, {
  youtubeLink: z.string().min(1, "Youtube link is required")
    .regex(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/, "Must be a valid YouTube URL"),
  additionalComments: z.string().optional(),
  roundId: z.number(),
}).pick({
  youtubeLink: true,
  additionalComments: true,
  roundId: true,
}).merge(songSchema.extend({
  songTitle: songSchema.shape.title,
  artist: songSchema.shape.artist,
}))

type SignupInput = z.infer<typeof signupSchema>

interface SignupFormProps {
  roundId: number;
  signupsCloseDateLabel: string;
  onSuccess?: () => void;
}

const formFields: FieldConfig[] = [
  {
    type: "input",
    name: "songTitle",
    label: "Song Title",
    placeholder: "Enter the song title",
  },
  {
    type: "input",
    name: "artist",
    label: "Artist",
    placeholder: "Enter the artist name",
  },
  {
    type: "input",
    name: "youtubeLink",
    label: "YouTube Link",
    placeholder: "Paste the YouTube URL",
    inputType: "url",
    description: "Link to the song on YouTube",
  },
  {
    type: "textarea",
    name: "additionalComments",
    label: "Additional Comments",
    placeholder: "Any additional comments about your submission",
    description: "Optional: Add any notes about your submission",
  },
];

export function SignupForm({ roundId, signupsCloseDateLabel, onSuccess }: SignupFormProps) {
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      songTitle: "",
      artist: "",
      youtubeLink: "",
      additionalComments: "",
      roundId,
    }
  })

  const onSubmit = async (formData: FormData): Promise<FormReturn> => {
    const { signup } = await userParticipationProvider();
    const result = await signup(formData);
    return result;
  }

  const { isLoading, handleSubmit } = useFormSubmission({
    onSubmit,
    form,
    onSuccess,
    successMessage: "You've successfully signed up for Everyone Plays the Same Song!",
  })

  return (
    <FormWrapper 
      title={`Sign Up for Everyone Plays the Same Song round ${roundId}`}
      description={`Signups close ${signupsCloseDateLabel}`}
      onSubmit={handleSubmit}
    >
      <Form {...form}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <input type="hidden" name="roundId" value={roundId} />
          <FormBuilder
            fields={formFields}
            control={form.control}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Signing up..." : "Sign Up"}
          </Button>
        </motion.div>
      </Form>
    </FormWrapper>
  )
}
