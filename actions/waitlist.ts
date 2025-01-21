'use server';

import { db } from "@/db";
import { mailingList } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

type WaitlistInput = {
  email: string;
  name: string;
};

export async function addToWaitlist({ email, name }: WaitlistInput) {
  try {
    // Check if email already exists
    const existing = await db
      .select({ email: mailingList.email })
      .from(mailingList)
      .where(eq(mailingList.email, email))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("This email is already on our waitlist");
    }

    // Add to mailing list
    await db
      .insert(mailingList)
      .values({
        id: sql`nextval('mailing_list_id_seq')`,
        email,
        name,
      });

    return { success: true };
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    throw error;
  }
} 