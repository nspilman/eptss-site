import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const getUserSession = async () => {
  const headerCookies = await cookies();
  const supabaseClient = await createClient(headerCookies);

  const { data: session } = await supabaseClient.auth.getSession();
  return { session: session?.session, user: session?.session?.user };
};

const signOut = async () => {
  const headerCookies = await cookies();
  const supabaseClient = await createClient(headerCookies);
  await supabaseClient.auth.signOut();
};

export const userSessionService = {
  getUserSession,
  signOut,
};
