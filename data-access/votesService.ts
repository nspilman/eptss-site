"use server";

import { Tables, Views } from "@/types";
import { isAdmin } from "@/utils/isAdmin";
import { createClient } from "@/utils/supabase/server";

export const getRoundOverrideVotes = async (roundId: number) => {
  const supabaseClient = await createClient();
  const { data, error } = await supabaseClient
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
  return { data, error };
};

export const getVoteResults = async (id: number) => {
  const supabaseClient = await createClient();

  const { data: voteResults } = await supabaseClient
    .from(Views.VoteResults)
    .select("title, artist, average, votes_count")
    .filter("round_id", "eq", id);

  return (
    voteResults?.map((result) => ({
      title: result.title || "",
      artist: result.artist || "",
      average: JSON.parse(result.average?.toPrecision(3) || "0"),
      votesCount: result.votes_count || 0
    })) || []
  );
};

export const getVotingUsersByRound = async (roundId: number) => {
  if(!await isAdmin()){
    return []
  }
  const supabaseClient = await createClient();
  const { data: userIds } = await supabaseClient
  .from(Tables.Votes)
  .select("user_id")
  .filter("round_id", "eq", roundId);
  return Array.from(new Set(userIds?.map(row => row.user_id)));
}
