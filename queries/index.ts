import { getSupabaseClient } from "utils/getSupabaseClient";

const supabase = getSupabaseClient();

export enum Tables {
  SignUps = "sign_ups",
  RoundMetadata = "round_metadata",
  MailingList = "mailing_list",
  Votes = "SongSelectionVotes",
  Submissions = "submissions",
}

export enum Views {
  VoteResults = "vote_results",
  VotesDiffsWithAverage = "votes_diff_with_average",
  Submissions = "submissions_view",
  VoteBreakdownBySong = "vote_breakdown_by_song",
}

export const getSignupsByRound = async (roundId: number) =>
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
