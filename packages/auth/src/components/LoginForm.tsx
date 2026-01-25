"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { loginSchema, type LoginInput } from "@eptss/core/schemas/user"
import { signInWithOTPAction } from "@eptss/actions"
import { motion } from "framer-motion"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@eptss/ui"
import { GoogleSignInButton } from "./GoogleSignInButton"
import { useState } from "react"

interface LoginFormProps {
  redirectUrl?: string
  titleOverride?: string
  onSuccess?: () => void
  description?: string
  referralCode?: string
}

export function LoginForm({
  redirectUrl = "/",
  titleOverride,
  onSuccess,
  description = "Enter your email to receive a magic link",
  referralCode
}: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    }
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await signInWithOTPAction({
        email: data.email,
        redirectUrl,
        referralCode
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Check your email for a login link' })
        form.reset()
        onSuccess?.()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{titleOverride || "Login"}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              {message && (
                <div className={`p-3 rounded text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending..." : "Send Login Link"}
              </Button>
            </motion.div>
            <GoogleSignInButton />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}