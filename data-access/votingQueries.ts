import { SupabaseClient } from "@supabase/supabase-js";
import { Tables } from "@/data-access";
import { getSupabaseClient } from "utils/getSupabaseClient";

export const getRoundOverrideVotes = async (
  roundId: number,
  supabase?: SupabaseClient
) =>
  await (supabase || (await getSupabaseClient()))
    .from(Tables.VotingCandidateOverrides)
    .select(
      `
  round_id,
  original_round_id,
  song_id,
  song:songs (
    title,
    artist
)
`
    )
    .eq("round_id", roundId)
    .order("original_round_id");

export const voting = { getRoundOverrideVotes };
