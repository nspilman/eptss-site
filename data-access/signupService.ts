"use server";

import { Tables } from "@/types";
import { createClient } from "@/utils/supabase/server";

export const getSignupsByRound = async (roundId: number) => {
  const supabase = await createClient();
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

export const getSignupUsersByRound = async (roundId: number) => {
  const supabase = await createClient();
  const { data } = await supabase.from(Tables.SignUps).select(
    `user_id,
    users:users(email, userid)
    )`
  ).eq("round_id", roundId)
  return data
} 
