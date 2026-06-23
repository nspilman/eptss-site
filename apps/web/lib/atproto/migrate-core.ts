/**
 * The submission-record write-core: "write an at.atjam.submission into a user's repo."
 *
 * Two "use server" callers compose this so a submission always lands the same way:
 *   - the cover migration / claim (claim-actions.ts), and
 *   - the native plyr-link submission (submit-actions.ts).
 *
 * The shape, per cover, in the user's OWN repo:
 *   at.atjam.submission/eptss-sub<id>  — with `payload` → the user's fm.plyr.track
 *
 * `payload` makes the submission reference a first-class record instead of raw storage;
 * the `url` is only kept as a fallback for a cover that has no plyr track at all. The plyr
 * track itself is landed elsewhere — uploaded into the user's repo in plyr-upload.ts (the
 * claim) or resolved from a pasted link in submit-actions.ts (a native submit) — and passed
 * in here as a strong-ref.
 *
 * No "use server": internal helpers, not RPC endpoints. They take a live Agent so the
 * caller restores the OAuth session once and owns the page refresh.
 */
import type { Agent } from "@atproto/api";
import {
  eptssSubmissionRkey,
  type StrongRef,
  type Submission,
} from "@eptss/atproto";

export const SUBMISSION_COLLECTION = "at.atjam.submission";

/**
 * The single home for "write an at.atjam.submission into a user's repo": upsert at the
 * stable `eptss-sub<id>` rkey and read it back to prove it resolves. The deliverable is
 * the plyr strong-ref when there is one (`payload`), else the legacy `url` — a
 * submission always carries exactly one — and an optional caption rides along as `note`.
 * Pure (no Postgres) and agent-injected, so both the cover migration (record built from
 * a scaffold) and a native submit (record built from the round) flow through it and stay
 * in lockstep. Idempotent on the rkey; returns the written ref.
 */
export async function writeSubmissionRecord(opts: {
  agent: Agent;
  did: string;
  submissionId: number;
  round: StrongRef;
  /** Preferred deliverable; falls back to `url` when absent. */
  plyrRef?: StrongRef | null;
  url?: string | null;
  note?: string | null;
  createdAt: string;
}): Promise<StrongRef> {
  const { agent, did, submissionId, round, plyrRef, url, note, createdAt } = opts;
  const rkey = eptssSubmissionRkey(submissionId);

  const record: Record<string, unknown> = { $type: SUBMISSION_COLLECTION, round, createdAt };
  if (plyrRef) record.payload = plyrRef;
  else if (url) record.url = url;
  if (note) record.note = note;

  const put = await agent.com.atproto.repo.putRecord({
    repo: did,
    collection: SUBMISSION_COLLECTION,
    rkey,
    record,
  });
  await agent.com.atproto.repo.getRecord({
    repo: did,
    collection: SUBMISSION_COLLECTION,
    rkey,
  });
  return { uri: put.data.uri, cid: put.data.cid };
}

/**
 * Write a migrated cover's at.atjam.submission from its admin-scaffold copy: round /
 * note / createdAt carried from the scaffold, the deliverable upgraded to the plyr
 * strong-ref (or the scaffold's legacy `url`). A thin adapter over writeSubmissionRecord.
 */
export async function writeOwnedSubmission(opts: {
  agent: Agent;
  did: string;
  submissionId: number;
  source: Submission;
  plyrRef: StrongRef | null;
}): Promise<StrongRef> {
  const { agent, did, submissionId, source, plyrRef } = opts;
  return writeSubmissionRecord({
    agent,
    did,
    submissionId,
    round: source.round,
    plyrRef,
    url: source.url ?? null,
    note: source.note ?? null,
    createdAt: source.createdAt,
  });
}
