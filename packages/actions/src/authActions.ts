"use server";

import { createClient } from "@eptss/data-access/utils/supabase/server";

/**
 * Server Action: Sign out the current user
 */
export async function signout() {
  const supabase = await createClient();
  return supabase.auth.signOut();
}
