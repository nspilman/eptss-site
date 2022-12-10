import { getSupabaseClient } from "utils/getSupabaseClient";

const supabase = getSupabaseClient();

export const getSignupsByRound = async (roundId: number) =>
  supabase
    .from("sign_ups")
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
