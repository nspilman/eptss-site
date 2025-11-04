"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useFormSubmission, FormWrapper, FormReturn } from "@eptss/forms"
import { usernamePasswordLoginSchema, usernamePasswordRegisterSchema } from "@eptss/data-access/schemas/auth"
import type { UsernamePasswordLoginInput, UsernamePasswordRegisterInput } from "@eptss/data-access/schemas/auth"
import { userSessionProvider } from "@eptss/data-access"
import { motion } from "framer-motion"
import { useState } from "react"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@eptss/ui"

interface PasswordAuthFormProps {
  redirectUrl?: string
  titleOverride?: string
  onSuccess?: () => void
}

export function PasswordAuthForm({ redirectUrl = "/", titleOverride, onSuccess }: PasswordAuthFormProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  
  // Login form
  const loginForm = useForm<UsernamePasswordLoginInput>({
    resolver: zodResolver(usernamePasswordLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    }
  })

  // Register form
  const registerForm = useForm<UsernamePasswordRegisterInput>({
    resolver: zodResolver(usernamePasswordRegisterSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    }
  })

  // Login submission handler
  const onLoginSubmit = async (formData: FormData): Promise<FormReturn> => {
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    
    const { signInWithPassword } = await userSessionProvider()
    const { error } = await signInWithPassword({ username, password })

    if (error) {
      return { status: "Error" as const, message: error.message }
    }

    return { status: "Success" as const, message: "Login successful" }
  }

  // Register submission handler
  const onRegisterSubmit = async (formData: FormData): Promise<FormReturn> => {
    const username = formData.get("username") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    const { signUpWithPassword } = await userSessionProvider()
    const { error } = await signUpWithPassword({ username, email, password })

    if (error) {
      return { status: "Error" as const, message: error.message }
    }

    return { status: "Success" as const, message: "Registration successful" }
  }

  // Form submission hooks
  const { isLoading: isLoginLoading, handleSubmit: handleLoginSubmit } = useFormSubmission({
    onSubmit: onLoginSubmit,
    form: loginForm,
    onSuccess: () => {
      // Trigger the parent's onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      // Signal that login was successful to trigger a page refresh
      return { shouldRefresh: true };
    },
    successMessage: "Login successful",
  })

  const { isLoading: isRegisterLoading, handleSubmit: handleRegisterSubmit } = useFormSubmission({
    onSubmit: onRegisterSubmit,
    form: registerForm,
    onSuccess,
    successMessage: "Registration successful",
  })

  // Each form uses its own loading state directly

  return (
    <FormWrapper 
      title={titleOverride || "Authentication"}
      description="Login or create a new account"
      onSubmit={activeTab === "login" ? handleLoginSubmit : handleRegisterSubmit}
    >
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        {/* Login Form */}
        <TabsContent value="login">
          <Form {...loginForm}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <input type="hidden" name="redirectUrl" value={redirectUrl} />
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="username"
                        autoComplete="username"
                        disabled={isLoginLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoginLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoginLoading} size="full">
                {isLoginLoading ? "Logging in..." : "Login"}
              </Button>
            </motion.div>
          </Form>
        </TabsContent>
        
        {/* Register Form */}
        <TabsContent value="register">
          <Form {...registerForm}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <input type="hidden" name="redirectUrl" value={redirectUrl} />
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="username"
                        autoComplete="username"
                        disabled={isRegisterLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
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
                        disabled={isRegisterLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isRegisterLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isRegisterLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isRegisterLoading} size="full">
                {isRegisterLoading ? "Registering..." : "Register"}
              </Button>
            </motion.div>
          </Form>
        </TabsContent>
      </Tabs>
    </FormWrapper>
  )
}
