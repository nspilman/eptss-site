'use client';

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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { FormWrapper } from "@/components/client/Forms/FormWrapper"
import { motion } from "framer-motion"
import { z } from "zod"
import { addToWaitlist } from "@/actions/waitlist"
import { mailingList } from "@/db/schema"
import { createInsertSchema } from "drizzle-zod"

// Create Zod schema from Drizzle table
const waitlistSchema = createInsertSchema(mailingList, {
  // Override the defaults if needed
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
}).pick({
  email: true,
  name: true,
})

type WaitlistInput = z.infer<typeof waitlistSchema>

export function WaitlistForm() {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<WaitlistInput>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: "",
      email: "",
    }
  })

  const onSubmit = async (formData: FormData) => {
    if (isLoading) return { error: "Form submission in progress" }
    
    setIsLoading(true)
    try {
      const name = formData.get("name") as string
      const email = formData.get("email") as string
      
      await addToWaitlist({ name, email })
      
      toast({
        title: "Success!",
        description: "You've been added to the waitlist. We'll contact you when registration opens for the next round.",
      })
      
      form.reset()
      return { success: true }
    } catch (error) {
      console.error("Waitlist error:", error)
      return { 
        error: error instanceof Error 
          ? error.message 
          : "There was a problem adding you to the waitlist. Please try again." 
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormWrapper
      title="Join the Waitlist"
      description="Sign up to be notified when registration opens for the next round"
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your name"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      {...field}
                      type="email"
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          {isLoading ? "Adding to waitlist..." : "Join Waitlist"}
        </Button>
      </motion.div>
    </FormWrapper>
  )
}