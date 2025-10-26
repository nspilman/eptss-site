"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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
  TabsContent,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@eptss/ui"

interface PasswordAuthFormProps {
  redirectUrl?: string
  titleOverride?: string
  onSuccess?: () => void
  description?: string
}

export function PasswordAuthForm({ 
  redirectUrl = "/", 
  titleOverride, 
  onSuccess,
  description = "Login or create a new account"
}: PasswordAuthFormProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)
  const [loginMessage, setLoginMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [registerMessage, setRegisterMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
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
  const onLoginSubmit = async (data: UsernamePasswordLoginInput) => {
    setIsLoginLoading(true)
    setLoginMessage(null)
    
    try {
      const { signInWithPassword } = await userSessionProvider()
      const { error } = await signInWithPassword({ 
        username: data.username, 
        password: data.password 
      })

      if (error) {
        setLoginMessage({ type: 'error', text: error.message })
      } else {
        setLoginMessage({ type: 'success', text: 'Login successful' })
        loginForm.reset()
        onSuccess?.()
      }
    } catch (error) {
      setLoginMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoginLoading(false)
    }
  }

  // Register submission handler
  const onRegisterSubmit = async (data: UsernamePasswordRegisterInput) => {
    setIsRegisterLoading(true)
    setRegisterMessage(null)
    
    try {
      const { signUpWithPassword } = await userSessionProvider()
      const { error } = await signUpWithPassword({ 
        username: data.username, 
        email: data.email, 
        password: data.password 
      })

      if (error) {
        setRegisterMessage({ type: 'error', text: error.message })
      } else {
        setRegisterMessage({ type: 'success', text: 'Registration successful' })
        registerForm.reset()
        onSuccess?.()
      }
    } catch (error) {
      setRegisterMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsRegisterLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{titleOverride || "Authentication"}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          {/* Login Form */}
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
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
                  {loginMessage && (
                    <div className={`p-3 rounded text-sm ${
                      loginMessage.type === 'success' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {loginMessage.text}
                    </div>
                  )}
                  <Button type="submit" disabled={isLoginLoading} className="w-full">
                    {isLoginLoading ? "Logging in..." : "Login"}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </TabsContent>
          
          {/* Register Form */}
          <TabsContent value="register">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
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
                  {registerMessage && (
                    <div className={`p-3 rounded text-sm ${
                      registerMessage.type === 'success' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {registerMessage.text}
                    </div>
                  )}
                  <Button type="submit" disabled={isRegisterLoading} className="w-full">
                    {isRegisterLoading ? "Registering..." : "Register"}
                  </Button>
                </motion.div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}