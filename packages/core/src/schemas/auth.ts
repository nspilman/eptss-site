import { z } from "zod"
import { users } from "../db/schema"
import { createInsertSchema } from "drizzle-zod"

// Create a Zod schema from your Drizzle schema
const userSchema = createInsertSchema(users)

// Schema for username/password login
export const usernamePasswordLoginSchema = z.object({
  username: userSchema.shape.username,
  password: z.string().min(8, "Password must be at least 8 characters"),
})

// Schema for username/password registration
export const usernamePasswordRegisterSchema = z.object({
  username: userSchema.shape.username,
  email: userSchema.shape.email,
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

// Type definitions
export type UsernamePasswordLoginInput = z.infer<typeof usernamePasswordLoginSchema>
export type UsernamePasswordRegisterInput = z.infer<typeof usernamePasswordRegisterSchema>
