"use server";

import { addToMailingList } from "@eptss/data-access/services/mailingListService";

type WaitlistInput = {
  email: string;
  name: string;
};

/**
 * Server Action: Add user to waitlist/mailing list
 */
export async function addToWaitlist({ email, name }: WaitlistInput) {
  try {
    return await addToMailingList(email, name);
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    throw error;
  }
}
