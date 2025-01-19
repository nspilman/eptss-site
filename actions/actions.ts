"use server";

import { Navigation } from "@/enum/navigation";
import { Tables } from "@/types";
import { getIsSuccess } from "@/utils";
import { createClient, getAuthUser } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";

const handleResponse = (status: number, tagToRevalidate: Navigation, errorMessage: string): FormReturn => {
  const isSuccess = getIsSuccess(status);
  if(isSuccess){
    revalidateTag(tagToRevalidate)
  }
  return { status: isSuccess ? "Success" : "Error", message: errorMessage };
}

export const signout = async () => {
  "use server";
  const supabase = await createClient();
  return supabase.auth.signOut();
};

export type Status = "Success" | "Error";
export type FormReturn = { status: Status; message: string;};

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
  const { status, error } = await client.from("submissions").insert(payload);
  return handleResponse(status, Navigation.Submit, error?.message || "")
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
  return handleResponse(status, Navigation.SignUp, error?.message || "")
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
  return handleResponse(status, Navigation.Voting, error?.message || "")
};
