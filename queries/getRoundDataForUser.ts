import { getSupabaseClient } from "utils/getSupabaseClient";

const supabase = getSupabaseClient();

export const getRoundDataForUser = async (roundId: number, userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
  userid,
  song_selection_votes ( round_id, created_at ),
  submissions ( round_id, created_at ),
  sign_ups ( round_id, created_at)
`
    )
    .eq("userid", userId)
    .eq("song_selection_votes.round_id", roundId)
    .eq("submissions.round_id", roundId)
    .eq("sign_ups.round_id", roundId);
  if (error) {
    throw new Error(error.message);
  }
  if (!data || data.length === 0) {
    return;
  }

  const user = data[0];
  const { song_selection_votes, submissions, sign_ups } = user;
  return {
    user,
    hasVoted:
      Array.isArray(song_selection_votes) && song_selection_votes.length > 0,
    hasSubmitted: Array.isArray(submissions) && submissions.length > 0,
    hasSignedUp: Array.isArray(sign_ups) && sign_ups.length > 0,
  };
};
