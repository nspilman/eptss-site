"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { count } from "drizzle-orm";

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
