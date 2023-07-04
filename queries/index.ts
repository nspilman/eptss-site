import { PostgrestError } from "@supabase/supabase-js";
import { getSupabaseClient } from "utils/getSupabaseClient";

const supabase = getSupabaseClient();

export enum Tables {
  SignUps = "sign_ups",
  RoundMetadata = "round_metadata",
  MailingList = "mailing_list",
  Votes = "song_selection_votes",
  Submissions = "submissions",
}

export enum Views {
  VoteResults = "vote_results",
  VotesDiffsWithAverage = "votes_diff_with_average",
  Submissions = "submissions_view",
  VoteBreakdownBySong = "vote_breakdown_by_song",
}

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

const getCurrentRound = async (): Promise<
  Round & { error: PostgrestError | null }
> => {
  const supabase = getSupabaseClient();
  const { data: currentRound } = await supabase.rpc("get_current_round");

  const {
    data: roundData,
    error,
    status,
  } = await supabase
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
    .filter("id", "eq", currentRound)
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

const getSignupsByRound = async (roundId: number) =>
  supabase
    .from(Tables.SignUps)
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

const queries = {
  getSignupsByRound,
  getCurrentRound,
};

export default queries;
