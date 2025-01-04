"use server";

import { Navigation } from "@/enum/navigation";
import { Tables } from "@/types";
import { getIsSuccess } from "@/utils";
import { createClient, getAuthUser } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";

export const signout = async () => {
  "use server";
  const supabase = await createClient();
  return supabase.auth.signOut();
};

export type Status = "Success" | "Error";
export type FormReturn = { status: Status; message: string };

export async function sendSignInLinkToEmail(
  formData: FormData
): Promise<FormReturn> {
  "use server";
  const supabaseClient = await createClient();

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

const getDataToString = (formData: FormData, key: string) => {
  return formData.get(key)?.toString();
};

export async function submitCover(formData: FormData): Promise<FormReturn> {
  "use server";
  const getToString = (key: string) => getDataToString(formData, key);;
  const client = await createClient();
  const { userId } = getAuthUser();

  const payload = {
    round_id: JSON.parse(getToString("roundId") || "-1"),
    soundcloud_url: getToString("soundcloudUrl") || "",
    user_id: userId || "",
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
  const client = await createClient();
  const { userId } = getAuthUser();

  const payload = {
    round_id: JSON.parse(getToString("roundId") || "-1"),
    user_id: userId || "",
    song_title: getToString("songTitle") || "",
    artist_name: getToString("artist") || "",
    youtube_link: getToString("youtubeLink") || "",
    additional_comments: getToString("additionalComments") || "",
  };

  const { status, error } = await client.rpc("signup", payload);
  const isSuccess = getIsSuccess(status);
  if (isSuccess) {
    revalidateTag(Navigation.SignUp);
  }
  return {
    status: getIsSuccess(status) ? "Success" : "Error",
    message: error?.message || "",
  };
}

export const submitVotes = async (
  { roundId }: { roundId: number },
  formData: FormData
): Promise<FormReturn> => {
  const { userId } = getAuthUser();
  const entries = formData.entries();
  const payload = Object.fromEntries(entries);
  const voteKeys = Object.keys(payload).filter(
    (key) => !["name", "email"].includes(key)
  );

  const votes = voteKeys
    .filter((key) => !["userId", "roundId"].includes(key))
    .map((key) => ({
      song_id: JSON.parse(key),
      vote: JSON.parse(formData.get(key)?.toString() || "-1"),
      round_id: roundId,
      user_id: userId,
    }));
  const client = await createClient();

  const { status, error } = await client.from(Tables.Votes).insert(votes);

  if (getIsSuccess(status)) {
    revalidateTag(Navigation.Voting);
  }

  return {
    status: getIsSuccess(status) ? "Success" : "Error",
    message: error?.message || "",
  };
};
