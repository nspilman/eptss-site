export * from "./database";
export * from "./roundDetails";

export type Status = "Success" | "Error";
export type FormReturn = { status: Status; message: string };

export enum Tables {
  SignUps = "sign_ups",
  RoundMetadata = "round_metadata",
  MailingList = "mailing_list",
  Votes = "song_selection_votes",
  Submissions = "submissions",
  VotingCandidateOverrides = "round_voting_candidate_overrides",
  UserSharePermissions = "user_share_permissions"
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

export type Phase = "signups" | "voting" | "covering" | "celebration";
