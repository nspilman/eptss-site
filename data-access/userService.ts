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
