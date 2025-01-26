"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { FormWrapper } from "@/components/client/Forms/FormWrapper"
import { motion } from "framer-motion"
import { z } from "zod"
import { createInsertSchema } from "drizzle-zod"
import { signUps, songs } from "@/db/schema"
import { userParticipationProvider } from "@/providers";

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
}

export function SignupForm({ roundId, signupsCloseDateLabel }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
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

  const onSubmit = async (formData: FormData) => {
    if (isLoading) return { error: "Form submission in progress" }
    
    setIsLoading(true)
    try {
      const { signup } = await userParticipationProvider();
      const result = await signup(formData);
      
      if (result.status !== "Success") {
        throw new Error(result.message || "Failed to sign up")
      }
      
      toast({
        title: "Success!",
        description: "You've successfully signed up for Everyone Plays the Same Song!",
      })
      
      form.reset()
      return { success: true }
    } catch (error) {
      console.error("Signup error:", error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : "There was a problem signing up. Please try again."
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      
      return { error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormWrapper
      title={`Sign Up for Everyone Plays the Same Song round ${roundId}`}
      description={`Signups close ${signupsCloseDateLabel}`}
      onSubmit={onSubmit}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="songTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Song Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the song title"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the artist name"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="youtubeLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Paste the YouTube URL"
                      {...field}
                      type="url"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Link to the song on YouTube
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="additionalComments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional comments about your submission"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Add any notes about your submission
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <input type="hidden" name="roundId" value={roundId} />
          </div>
        </Form>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
          variant="default"
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </Button>
      </motion.div>
    </FormWrapper>
  )
}
