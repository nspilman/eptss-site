"use server";

import { createClient } from "@eptss/data-access/utils/supabase/server";
import { logger } from "@eptss/logger/server";

/**
 * Server Action: Sign out the current user
 */
export async function signout() {
  logger.action('signout', 'started');

  try {
    const supabase = await createClient();
    const result = await supabase.auth.signOut();
    logger.action('signout', 'completed');
    return result;
  } catch (error) {
    logger.action('signout', 'failed', {
      error: error instanceof Error ? error : undefined
    });
    throw error;
  }
}
