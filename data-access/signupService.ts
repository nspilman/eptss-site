"use server";

import { Tables } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export const getSignupsByRound = async (roundId: number) => {
  const headerCookies = await cookies();
  const supabase = await createClient(headerCookies);
  const { data } = await supabase
    .from(Tables.SignUps)
    .select(
      `
  round_id,
  song_id,
  youtube_link,
  song:songs (
      title,
      artist
  )
`
    )
    .eq("round_id", roundId)
    .order("created_at");

  return data;
};
