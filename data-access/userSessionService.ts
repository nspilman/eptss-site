"use server";
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

const signInWithOTP = async ({
  email,
  redirectUrl,
}: {
  email: string;
  redirectUrl?: string;
}) => {
  const headerCookies = await cookies();
  const supabaseClient = await createClient(headerCookies);
  const { error } = await supabaseClient.auth.signInWithOtp({
    email: email?.trim() || "",
    options: {
      shouldCreateUser: true,
      emailRedirectTo: redirectUrl,
    },
  });
  return { error };
};

export const userSessionService = {
  getUserSession,
  signOut,
  signInWithOTP,
};
