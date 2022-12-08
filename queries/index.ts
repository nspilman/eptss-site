import { SupabaseClient } from "@supabase/supabase-js";

export const getCurrentRound = async (
  supabase: SupabaseClient<any, "public", any>
) => {
  const {
    data: roundData,
    error,
    status,
  } = await supabase
    .from("round_metadata")
    .select(
      "id, signup_opens, voting_opens, covering_begins, covers_due, listening_party"
    )
    .order("id", { ascending: false })
    .limit(1);

  if (roundData) {
    const {
      id: roundId,
      signup_opens: signupOpens,
      voting_opens: votingOpens,
      covering_begins: coveringBegins,
      covers_due: coversDue,
      listening_party: listeningParty,
    } = roundData[0];
    if (typeof roundId === "number") {
      return {
        roundId,
        signupOpens,
        votingOpens,
        coveringBegins,
        coversDue,
        listeningParty,
        status,
        error,
      };
    }
  }

  return { roundId: -1, status, error };
};

export const getSignupsByRound = async (
  supabase: SupabaseClient<any, "public", any>,
  roundId: number
) =>
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
