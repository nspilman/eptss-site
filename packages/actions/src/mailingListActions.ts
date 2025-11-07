"use server";

import { addToMailingList } from "@eptss/data-access/services/mailingListService";
import { logger } from "@eptss/logger/server";

type WaitlistInput = {
  email: string;
  name: string;
};

/**
 * Server Action: Add user to waitlist/mailing list
 */
export async function addToWaitlist({ email, name }: WaitlistInput) {
  logger.action('addToWaitlist', 'started', { email });

  try {
    const result = await addToMailingList(email, name);
    logger.action('addToWaitlist', 'completed', { email });
    return result;
  } catch (error) {
    logger.action('addToWaitlist', 'failed', {
      email,
      error: error instanceof Error ? error : undefined
    });
    throw error;
  }
}
