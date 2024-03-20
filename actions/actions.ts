"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { AppProps } from "next/app";

export const signout = async () => {
  "use server";
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  return supabase.auth.signOut();
};

export type Status = "Success" | "Error";
export type FormReturn = { status: Status; message: string };

export async function sendSignInLinkToEmail(
  formData: FormData
): Promise<FormReturn> {
  "use server";
  const cookieStore = cookies();
  const supabaseClient = await createClient(cookieStore);

  const email = formData.get("email")?.toString();
  if (!email) {
    return {
      status: "Error",
      message: "Email required",
    };
  }

  const emailRedirectTo = `${process.env.NEXT_PUBLIC_BASE_URL}`;

  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
    },
  });
  if (error) {
    return { status: "Error", message: error.message };
  }
  return {
    status: "Success",
    message: "Check your email for your login link!",
  };
}
