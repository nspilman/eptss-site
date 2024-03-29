"use server";

import { getIsSuccess } from "@/utils";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const signout = async () => {
  "use server";
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  return supabase.auth.signOut();
};

export type Status = "Success" | "Error";
export type FormReturn = { status: Status; message: string };

export async function sendSignInLinkToEmail(
  formData: FormData
): Promise<FormReturn> {
  "use server";
  const cookieStore = await cookies();
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

interface SubmitModel {
  soundcloudUrl: string;
  coolThingsLearned?: string;
  toolsUsed?: string;
  happyAccidents?: string;
  didntWork?: string;
  userId: string;
}

interface SubmitEntity {
  round_id: number;
  soundcloud_url: string;
  additional_comments?: string;
  user_id: string;
}

const getDataToString = (formData: FormData, key: string) => {
  return formData.get(key)?.toString();
};

export async function submitCover(formData: FormData): Promise<FormReturn> {
  "use server";
  const getToString = (key: string) => getDataToString(formData, key);
  const headerCookies = await cookies();
  const client = createClient(headerCookies);

  const payload = {
    round_id: JSON.parse(getToString("roundId") || "-1"),
    soundcloud_url: getToString("soundcloudUrl") || "",
    user_id: getToString("userId") || "",
    additional_comments: JSON.stringify({
      coolThingsLearned: getToString("coolThingsLearned") || "",
      toolsUsed: getToString("toolsUsed") || "",
      happyAccidents: getToString("happyAccidents") || "",
      didntWork: getToString("didntWork") || "",
    }),
  };
  const { status } = await client.from("submissions").insert(payload);
  return { status: getIsSuccess(status) ? "Success" : "Error", message: "" };
}

export async function signup(formData: FormData): Promise<FormReturn> {
  "use server";

  const getToString = (key: string) => getDataToString(formData, key);
  const headerCookies = await cookies();
  const client = createClient(headerCookies);

  const payload = {
    round_id: JSON.parse(getToString("roundId") || "-1"),
    user_id: getToString("userId") || "",
    song_title: getToString("songTitle") || "",
    artist_name: getToString("artist") || "",
    youtube_link: getToString("youtubeLink") || "",
    additional_comments: getToString("additionalComments") || "",
  };

  const { status } = await client.rpc("signup", payload);
  return { status: getIsSuccess(status) ? "Success" : "Error", message: "" };
}

export const submitVotes = async (formData: FormData) => {
  const entries = formData.entries();
  const payload = Object.fromEntries(entries);
  console.log({ payload });
  return { status: "Success" as const, message: "" };
  // return payload;
};
