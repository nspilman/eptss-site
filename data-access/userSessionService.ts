"use server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const getUser = async () => {
  const headerCookies = await cookies();
  const supabaseClient = await createClient(headerCookies);

  const { data } = await supabaseClient.auth.getUser();
  return { user: data.user };
};

export const signOut = async () => {
  const headerCookies = await cookies();
  const supabaseClient = await createClient(headerCookies);
  await supabaseClient.auth.signOut();
};

export const signInWithOTP = async ({
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
      emailRedirectTo: redirectUrl ?? "/",
    },
  });
  return { error };
};
