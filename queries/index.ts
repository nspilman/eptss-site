import { PostgrestError } from "@supabase/supabase-js";
import { getSupabaseClient } from "utils/getSupabaseClient";

const supabase = getSupabaseClient();

interface Round {
  roundId: number;
  signupOpens: string;
  votingOpens: string;
  coveringBegins: string;
  coversDue: string;
  listeningParty: string;
  status: number;
}

export const getCurrentRound = async (): Promise<
  Round & { error: PostgrestError | null }
> => {
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

  throw new Error("Could not find round");
};

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
