"use client"

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
import { loginSchema, type LoginInput } from "@/lib/schemas/user"
import { userSessionProvider } from "@/providers"
import { FormWrapper } from "../Forms/FormWrapper"
import { motion } from "framer-motion"

interface LoginFormProps {
  redirectUrl?: string
  titleOverride?: string
  onSuccess?: () => void
}

export function LoginForm({ redirectUrl = "/", titleOverride, onSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    }
  })

  const onSubmit = async (formData: FormData) => {
    if (isLoading) return { error: "Form submission in progress" }
    
    setIsLoading(true)
    try {
      const email = formData.get("email") as string
      const { signInWithOTP } = await userSessionProvider()
      const { error } = await signInWithOTP({ email, redirectUrl })

      if (error) {
        return { error: error.message }
      }

      toast({
        title: "Success!",
        description: "Check your email for a login link",
      })

      if (onSuccess) {
        onSuccess()
      }
      form.reset()
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormWrapper 
      title={titleOverride || "Login"}
      description="Enter your email to receive a magic link"
      onSubmit={onSubmit}
    >
      <input type="hidden" name="redirectUrl" value={redirectUrl} />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Form {...form}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="email@example.com"
                    {...field}
                    type="email"
                    name="email"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          {isLoading ? "Sending..." : "Send Login Link"}
        </Button>
      </motion.div>
    </FormWrapper>
  )
}