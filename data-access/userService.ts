"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export const getUserCount = async () => {
  const result = await db
    .select({ count: count() })
    .from(users);
  return result[0].count;
};

export const getAllUsers = async () => {
  const result = await db
    .select({
      userid: users.userid,
      email: users.email,
      username: users.username,
    })
    .from(users)
    .orderBy(users.username);
  
  return result;
};

/**
 * Get user information by user ID
 * Used in Server Actions for email confirmations
 */
export const getUserInfo = async (userId: string) => {
  const result = await db
    .select({ 
      email: users.email, 
      username: users.username 
    })
    .from(users)
    .where(eq(users.userid, userId))
    .limit(1);
  
  return result[0] || null;
};
