import { z } from "zod"
import { users } from "@/db/schema"
import { createInsertSchema } from "drizzle-zod"

// Create a Zod schema from your Drizzle schema
export const userSchema = createInsertSchema(users)

// Create specific schemas for different operations
export const loginSchema = z.object({
  email: userSchema.shape.email
})

// You can also extend the schema with additional validation
export const registerSchema = userSchema.pick({
  email: true,
  username: true,
})

// Schema for updating user profile
export const updateUserSchema = userSchema.partial().omit({
  userid: true,
  createdAt: true,
})

// Type definitions
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
