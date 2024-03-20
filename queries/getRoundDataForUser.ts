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

  const [user] = data;
  const { song_selection_votes: votes, submissions, sign_ups } = user;
  const isUserAttributeTruthy = (
    val: typeof votes | typeof submissions | typeof sign_ups
  ) => !!(Array.isArray(val) && val.length);
  return {
    user,
    hasVoted: isUserAttributeTruthy(votes),
    hasSubmitted: isUserAttributeTruthy(submissions),
    hasSignedUp: isUserAttributeTruthy(sign_ups),
  };
};
