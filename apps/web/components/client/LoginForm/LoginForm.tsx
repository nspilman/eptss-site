"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormSubmission } from "@/hooks/useFormSubmission"
import { loginSchema, type LoginInput } from "@eptss/data-access/schemas/user"
import { userSessionProvider } from "@eptss/data-access"
import { FormWrapper } from "../Forms/FormWrapper"
import { motion } from "framer-motion"
import { FormReturn } from "@/types"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Button
} from "@eptss/ui"
import { GoogleSignInButton } from "./GoogleSignInButton"

interface LoginFormProps {
  redirectUrl?: string
  titleOverride?: string
  onSuccess?: () => void
}

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
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="email@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} size="full">
            {isLoading ? "Sending..." : "Send Login Link"}
          </Button>
        </motion.div>
        <GoogleSignInButton />
      </Form>
    </FormWrapper>
  )
}