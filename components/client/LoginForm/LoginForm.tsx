"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormSubmission } from "@/hooks/useFormSubmission"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { loginSchema, type LoginInput } from "@/lib/schemas/user"
import { userSessionProvider } from "@/providers"
import { FormWrapper } from "../Forms/FormWrapper"
import { motion } from "framer-motion"
import { FormReturn } from "@/types"
import { FormBuilder, FieldConfig } from "@/components/ui/form-fields/FormBuilder"

interface LoginFormProps {
  redirectUrl?: string
  titleOverride?: string
  onSuccess?: () => void
}

const formFields: FieldConfig[] = [
  {
    type: "input",
    name: "email",
    label: "Email",
    placeholder: "email@example.com",
    inputType: "email",
    autoComplete: "email",
  },
];

export function LoginForm({ redirectUrl = "/", titleOverride, onSuccess }: LoginFormProps) {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    }
  })

  const onSubmit = async (formData: FormData): Promise<FormReturn> => {
    const email = formData.get("email") as string
    const { signInWithOTP } = await userSessionProvider()
    const { error } = await signInWithOTP({ email, redirectUrl })

    if (error) {
      return { status: "Error" as const, message: error.message }
    }

    return { status: "Success" as const, message: "Check your email for a login link" }
  }

  const { isLoading, handleSubmit } = useFormSubmission({
    onSubmit,
    form,
    onSuccess,
    successMessage: "Check your email for a login link",
  })

  return (
    <FormWrapper 
      title={titleOverride || "Login"}
      description="Enter your email to receive a magic link"
      onSubmit={handleSubmit}
    >
      <Form {...form}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <input type="hidden" name="redirectUrl" value={redirectUrl} />
          <FormBuilder
            fields={formFields}
            control={form.control}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Sending..." : "Send Login Link"}
          </Button>
        </motion.div>
      </Form>
    </FormWrapper>
  )
}