"use server";
import { createClient } from "@/utils/supabase/server";

export const getUser = async () => {
  const supabaseClient = await createClient();

  const { data } = await supabaseClient.auth.getUser();
  return { user: data.user };
};

export const signOut = async () => {
  const supabaseClient = await createClient();
  await supabaseClient.auth.signOut();
};

export const signInWithOTP = async ({
  email,
  redirectUrl,
}: {
  email: string;
  redirectUrl?: string;
}) => {
  const supabaseClient = await createClient();
  const { error } = await supabaseClient.auth.signInWithOtp({
    email: email?.trim() || "",
    options: {
      shouldCreateUser: true,
      emailRedirectTo: redirectUrl ?? "/",
    },
  });
  return { error };
};
