"use server";
import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { Tables } from "queries";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export interface Round {
  roundId: number;
  signupOpens: string;
  votingOpens: string;
  coveringBegins: string;
  coversDue: string;
  listeningParty: string;
  typeOverride?: string;
  song: { artist: string; title: string };
}

const defaultDateString = "1970/01/01";

const getClient = async () => {
  const cookieHeaders = await cookies();
  const client = await createClient(cookieHeaders);
  return client;
};

export const getCurrentRoundId = async () => {
  const client = await getClient();
  const { data: currentRound } = await client.rpc("get_current_round");
  return currentRound || -1;
};

export const getRoundById = async (roundId: number) => {
  const client = await getClient();
  const {
    data: roundData,
    error,
    status,
  } = await client
    .from(Tables.RoundMetadata)
    .select(
      `id, 
        signup_opens, 
        voting_opens, 
        covering_begins, 
        covers_due, 
        listening_party, 
        round_type_override,
        song:songs(
          title, 
          artist
          )`
    )
    .filter("id", "eq", roundId)
    .limit(1);

  if (roundData) {
    const {
      id: roundId,
      signup_opens: signupOpens,
      voting_opens: votingOpens,
      covering_begins: coveringBegins,
      covers_due: coversDue,
      listening_party: listeningParty,
      round_type_override: typeOverride,
      song,
    } = roundData[0];

    if (Array.isArray(song)) {
      throw new Error("Only one song can be associated with a single round");
    }
    const songData = song || { artist: "", title: "" };
    if (typeof roundId === "number") {
      return {
        roundId,
        signupOpens: signupOpens || defaultDateString,
        votingOpens: votingOpens || defaultDateString,
        coveringBegins: coveringBegins || defaultDateString,
        coversDue: coversDue || defaultDateString,
        listeningParty: listeningParty || defaultDateString,
        error,
        song: songData,
        typeOverride: typeOverride || undefined,
      };
    }
  }

  throw new Error("Could not find round");
};

export const getCurrentRound = async (): Promise<
  Round & { error: PostgrestError | null }
> => {
  return await getRoundById(await getCurrentRoundId());
};

export const getCurrentAndFutureRounds = async (
  supabase?: SupabaseClient
): Promise<{ data: Round[]; error: PostgrestError | null }> => {
  const client = await getClient();

  const {
    data: roundData,
    error,
    status,
  } = await client
    .from(Tables.RoundMetadata)
    .select(
      `id, 
          signup_opens, 
          voting_opens, 
          covering_begins, 
          covers_due, 
          listening_party, 
          round_type_override,
          song:songs(
            title, 
            artist
            )`
    )
    .filter("id", "gte", await getCurrentRoundId())
    .order("id");

  const formattedRoundData = await roundData?.map(
    ({
      id,
      signup_opens,
      voting_opens,
      covering_begins,
      covers_due,
      listening_party,
      song,
      round_type_override,
    }) => ({
      roundId: id,
      signupOpens: signup_opens || defaultDateString,
      votingOpens: voting_opens || defaultDateString,
      coveringBegins: covering_begins || defaultDateString,
      coversDue: covers_due || defaultDateString,
      listeningParty: listening_party || defaultDateString,
      song: song || { artist: "", title: "" },
      typeOverride: round_type_override || undefined,
    })
  );
  if (formattedRoundData) {
    return { data: formattedRoundData, error };
  }

  throw new Error("Could not find round");
};
