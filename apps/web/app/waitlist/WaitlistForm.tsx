"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormSubmission } from "@/hooks/useFormSubmission"
import { Button, Form } from "@eptss/ui"
import { FormWrapper } from "@/components/client/Forms/FormWrapper"
import { motion } from "framer-motion"
import { z } from "zod"
import { addToWaitlist } from "@/actions/waitlist"
import { mailingList } from "@/db/schema"
import { createInsertSchema } from "drizzle-zod"
import { FormReturn } from "@/types";
import { FormBuilder, FieldConfig } from "@eptss/ui";

// Create Zod schema from Drizzle table
const waitlistSchema = createInsertSchema(mailingList, {
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
})

type WaitlistInput = z.infer<typeof waitlistSchema>

const formFields: FieldConfig[] = [
  {
    type: "input",
    name: "name",
    label: "Name",
    placeholder: "Your name",
    autoComplete: "name",
  },
  {
    type: "input",
    name: "email",
    label: "Email",
    placeholder: "your.email@example.com",
    inputType: "email",
    autoComplete: "email",
  },
];

interface WaitlistFormProps {
  onSuccess?: () => void;
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const form = useForm<WaitlistInput>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: "",
      email: "",
    }
  })

  const onSubmit = async (formData: FormData): Promise<FormReturn> => {
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    }
    await addToWaitlist(data)
    return {
      status: "Success" as const,
      message: "You've been added to the waitlist. We'll contact you when registration opens for the next round."
    }
  }

  const { isLoading, handleSubmit } = useFormSubmission({
    onSubmit,
    form,
    successMessage: "You've been added to the waitlist. We'll contact you when registration opens for the next round.",
    onSuccess,
  })

  return (
    <FormWrapper
      title="Join the Waitlist"
      description="Sign up to be notified when registration opens for the next round"
      onSubmit={handleSubmit}
    >
      <Form {...form}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <FormBuilder
            fields={formFields}
            control={form.control}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} size="full">
            {isLoading ? "Adding to waitlist..." : "Join Waitlist"}
          </Button>
        </motion.div>
      </Form>
    </FormWrapper>
  )
}