import { db } from "../db";
import { mailingList } from "../db/schema";
import { eq } from "drizzle-orm";

export async function addToMailingList(email: string, name: string) {
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
      email,
      name,
    });

  return { success: true };
}
