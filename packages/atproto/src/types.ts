/**
 * The shapes EPTSS reads off the AT Protocol network. These mirror the
 * at.atjam.* lexicon records (the generic coordination layer) plus the
 * EPTSS-specific `site.eptss.song` subject the backfill embeds. Kept as
 * loose, read-tolerant interfaces — this package only ever reads.
 */

export interface StrongRef {
  uri: string;
  cid: string;
}

export interface Milestone {
  label: string;
  date: string;
}

export type RoundState = "open" | "in-progress" | "closed";

/** A candidate song people signed up suggesting. */
export interface SelectionSignup {
  title: string;
  artist: string;
  count?: number;
}

/**
 * Aggregate vote result for one candidate song. Stores the integer `total`
 * (sum of scores) + `count` — ATProto records are DAG-CBOR (no floats), so the
 * average is total/count, computed here at display time.
 */
export interface SelectionVote {
  title: string;
  artist: string;
  total: number;
  count: number;
}

/** The EPTSS song-selection data nested in a round's subject. */
export interface EptssSelection {
  signups?: SelectionSignup[];
  voteResults?: SelectionVote[];
}

/** A round's `subject` as EPTSS writes it: the chosen song + how it was picked. */
export interface EptssSong {
  $type?: string;
  title?: string;
  artist?: string;
  createdAt?: string;
  selection?: EptssSelection;
}

export interface ClosingEvent {
  $type?: string;
  playlistUrl?: string;
  [k: string]: unknown;
}

export interface Round {
  $type?: string;
  jam: StrongRef;
  name?: string;
  assignment: string;
  subject?: EptssSong;
  acceptedSubmissionTypes: string[];
  milestones: Milestone[];
  closingEvent?: ClosingEvent;
  createdAt: string;
}

export interface Submission {
  $type?: string;
  round: StrongRef;
  payload?: StrongRef;
  url?: string;
  note?: string;
  createdAt: string;
}

export interface Jam {
  $type?: string;
  name?: string;
  description?: string;
  createdAt?: string;
}

/** A record as returned by com.atproto.repo.listRecords. */
export interface RecordEnvelope<T> {
  uri: string;
  cid: string;
  value: T;
}
