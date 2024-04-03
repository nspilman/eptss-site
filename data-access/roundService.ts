import { PostgrestError } from "@supabase/supabase-js";
import { Tables, Views } from "@/data-access";
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

const getCurrentRoundId = async () => {
  const client = await getClient();
  const { data: currentRound } = await client.rpc("get_current_round");
  return currentRound || -1;
};

const getRoundById = async (roundId: number) => {
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

  if (roundData?.length) {
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

  return;
};

export const getCurrentRound = async (): Promise<
  Round & { error: PostgrestError | null }
> => {
  const currentRound = await getRoundById(await getCurrentRoundId());
  if (!currentRound) {
    throw new Error("Unable to find current round");
  }
  return currentRound;
};

const getFormattedRoundData = async (
  roundData:
    | {
        id: number;
        signup_opens: string | null;
        voting_opens: string | null;
        covering_begins: string | null;
        covers_due: string | null;
        listening_party: string | null;
        playlist_url: string | null;
        round_type_override: "runner_up" | null;
        song: {
          artist: string;
          title: string;
        } | null;
      }[]
    | null
) => {
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
      playlist_url,
    }) => ({
      roundId: id,
      signupOpens: signup_opens || defaultDateString,
      votingOpens: voting_opens || defaultDateString,
      coveringBegins: covering_begins || defaultDateString,
      coversDue: covers_due || defaultDateString,
      listeningParty: listening_party || defaultDateString,
      song: song || { artist: "", title: "" },
      typeOverride: round_type_override || undefined,
      playlistUrl: playlist_url || "",
    })
  );
  if (formattedRoundData) {
    return formattedRoundData;
  }

  throw new Error("Could not find round");
};

const roundQuery = `id, 
signup_opens, 
voting_opens, 
covering_begins, 
covers_due, 
listening_party, 
round_type_override,
playlist_url,
song:songs(
  title, 
  artist
  )`;

const getCurrentAndFutureRounds = async (): Promise<{
  data: Round[];
  error: PostgrestError | null;
}> => {
  const client = await getClient();

  const { data: roundData, error } = await client
    .from(Tables.RoundMetadata)
    .select(roundQuery)
    .filter("id", "gte", await getCurrentRoundId())
    .order("id");

  const formattedRoundData = await getFormattedRoundData(roundData);
  return { data: formattedRoundData, error };
};

const getCurrentAndPastRounds = async () => {
  const client = await getClient();

  const { data: roundData, error } = await client
    .from(Tables.RoundMetadata)
    .select(roundQuery)
    .filter("id", "lte", await getCurrentRoundId())
    .filter("voting_opens", "lte", new Date().toISOString())
    .order("id", { ascending: false });

  const formattedRoundData = await getFormattedRoundData(roundData);
  return { data: formattedRoundData, error };
};

const getRoundMetadata = async (id: number) => {
  const client = await getClient();

  const { data } = await client
    .from(Tables.RoundMetadata)
    .select(
      `playlist_url,
        id,
        song_id, 
        song:songs(artist, title)`
    )
    .filter("id", "eq", id);

  const roundInfo = data?.[0];

  if (!roundInfo) {
    return {
      playlistUrl: "",
      title: "",
      artist: "",
      submitter: "",
    };
  }
  const { data: submitterInfo } = (await client
    .from(Views.Signups)
    .select("username")
    .filter("title", "eq", roundInfo.song?.title)
    .filter("artist", "eq", roundInfo.song?.artist)
    .filter("round_id", "eq", roundInfo?.id)) as {
    data: {
      username: string;
    }[];
  };

  return {
    playlistUrl: roundInfo.playlist_url || "",
    title: roundInfo.song?.title || "",
    artist: roundInfo.song?.artist || "",
    submitter: submitterInfo.length ? submitterInfo[0].username : "",
  };
};

const getSubmissions = async (id: number) => {
  const client = await getClient();

  const { data } = await client
    .from(Views.PublicSubmissions)
    .select("*")
    .filter("round_id", "eq", id);
  return data?.map((val) => ({
    artist: val.artist || "",
    created_at: val.created_at || "",
    round_id: val.round_id || -1,
    soundcloud_url: val.soundcloud_url || "",
    title: val.title || "",
    username: val.username || "",
  }));
};

const getVoteBreakdownBySong = async (id: number) => {
  const dbClient = await getClient();

  const { data } = await dbClient
    .from(Views.VoteBreakdownBySong)
    .select()
    .filter("round_id", "eq", id);

  return (
    data?.map(
      ({
        title,
        artist,
        one_count,
        two_count,
        three_count,
        four_count,
        five_count,
      }) => ({
        title: title || "",
        artist: artist || "",
        oneCount: one_count || 0,
        twoCount: two_count || 0,
        threeCount: three_count || 0,
        fourCount: four_count || 0,
        fiveCount: five_count || 0,
      })
    ) || []
  );
};

export const roundService = {
  getCurrentRound,
  getCurrentAndFutureRounds,
  getRoundById,
  getCurrentRoundId,
  getRoundMetadata,
  getCurrentAndPastRounds,
  getSubmissions,
  getVoteBreakdownBySong,
};
