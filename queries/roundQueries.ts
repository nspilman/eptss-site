import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { Tables } from "queries";
import { getSupabaseClient } from "utils/getSupabaseClient";

interface Round {
  roundId: number;
  signupOpens: string;
  votingOpens: string;
  coveringBegins: string;
  coversDue: string;
  listeningParty: string;
  status: number;
  song: { artist: string; title: string };
}

const getCurrentRoundId = async (supabase?: SupabaseClient) => {
  const { data: currentRound } = await (supabase || getSupabaseClient()).rpc(
    "get_current_round"
  );
  return currentRound as unknown as number;
};

const getCurrentRound = async (
  supabase?: SupabaseClient
): Promise<Round & { error: PostgrestError | null }> => {
  const {
    data: roundData,
    error,
    status,
  } = await (supabase || (await getSupabaseClient()))
    .from(Tables.RoundMetadata)
    .select(
      `id, 
        signup_opens, 
        voting_opens, 
        covering_begins, 
        covers_due, 
        listening_party, 
        song:songs(
          title, 
          artist
          )`
    )
    .filter(
      "id",
      "eq",
      await getCurrentRoundId(supabase || (await getSupabaseClient()))
    )
    .limit(1);

  if (roundData) {
    const {
      id: roundId,
      signup_opens: signupOpens,
      voting_opens: votingOpens,
      covering_begins: coveringBegins,
      covers_due: coversDue,
      listening_party: listeningParty,
      song,
    } = roundData[0];

    if (Array.isArray(song)) {
      throw new Error("Only one song can be associated with a single round");
    }
    const songData = song || { artist: "", title: "" };
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
        song: songData,
      };
    }
  }

  throw new Error("Could not find round");
};

export const round = {
  getCurrentRound,
  getCurrentRoundId,
};
