import { getSupabaseClient } from "utils/getSupabaseClient";
import { round } from "./roundQueries";
import { signups } from "./signups";

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
  PublicSignups = "public_signups",
  Signups = "signups",
  PublicSubmissions = "public_submissions",
}

const queries = {
  signups,
  round,
};

export default queries;
