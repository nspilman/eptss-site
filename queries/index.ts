import { getSupabaseClient } from "utils/getSupabaseClient";

const supabase = getSupabaseClient();

export enum Tables {
  SignUps = "sign_ups",
}

export const getSignupsByRound = async (roundId: number) =>
  supabase
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
