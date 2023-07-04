import { SupabaseClient } from "@supabase/supabase-js";
import { Tables } from "queries";
import { getSupabaseClient } from "utils/getSupabaseClient";

const getSignupsByRound = async (roundId: number, supabase?: SupabaseClient) =>
  await (supabase || (await getSupabaseClient()))
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

export const signups = { getSignupsByRound };
