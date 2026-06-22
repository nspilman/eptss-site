"use server";

/**
 * Native plyr submission — the submission flow going forward.
 *
 * The user uploads their song to plyr.fm directly and pastes the track link. We resolve
 * it to the `fm.plyr.track` in their OWN repo and write the `at.atjam.submission`
 * straight into their PDS, with `payload` → that track. No Supabase upload, no admin
 * scaffold, no later claim step: the deliverable is born owned. (The upload path lives
 * on only for past records — `migrate-to-plyr` + the claim flow.)
 *
 * Order is deliberate — PDS first. The `at.atjam.submission` record is written and read
 * back BEFORE the Postgres row is touched, so a failed network write leaves nothing
 * half-done; the user just retries (the stable `eptss-sub<id>` rkey upserts). Only once
 * the record resolves do we record the Postgres row + crosswalk.
 *
 * Requires a linked Bluesky account: the ownership guard (the plyr track must be the
 * submitter's own) needs their DID, and the record is written to their repo.
 *
 * Per the lexicon, `note` is a short public caption (≤300 graphemes); the long-form
 * reflection prompts stay in Postgres `additional_comments`, where they always lived.
 */

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@eptss/auth/server";
import { loadIdentity } from "@eptss/auth/atproto";
import { db, submissions, roundMetadata, eq, and, desc } from "@eptss/db";
import {
  eptssRoundRkey,
  getRoundRecord,
  resolvePlyrUrlToRecord,
  PlyrResolveError,
  type StrongRef,
} from "@eptss/atproto";
import type { FormReturn } from "@eptss/forms";
import { getUserAgent } from "./agent";
import { writeSubmissionRecord } from "./migrate-core";

const NOTE_MAX_GRAPHEMES = 300;

const fail = (message: string): FormReturn => ({ status: "Error", message });

/** Trim a caption to the lexicon's grapheme budget without splitting a glyph. */
function clampGraphemes(text: string, max: number): string {
  const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const graphemes = [...seg.segment(text)].map((s) => s.segment);
  if (graphemes.length <= max) return text;
  return graphemes.slice(0, max).join("").trimEnd();
}

const str = (formData: FormData, key: string): string | undefined => {
  const v = formData.get(key)?.toString().trim();
  return v ? v : undefined;
};

/**
 * Create (or update) a submission from a pasted plyr track link. Idempotent on the
 * stable rkey, so a re-submit upserts the same record and refreshes the Postgres row.
 */
export async function submitPlyrCover(formData: FormData): Promise<FormReturn> {
  try {
    const { userId } = await getAuthUser();
    if (!userId) return fail("You must be logged in to submit.");

    const roundId = Number(formData.get("roundId"));
    if (!Number.isInteger(roundId) || roundId <= 0) return fail("Missing round.");

    const plyrTrackUrl = str(formData, "plyrTrackUrl");
    if (!plyrTrackUrl) return fail("Paste your plyr track link.");

    const identity = await loadIdentity(userId);
    if (!identity) return fail("Link your Bluesky account before submitting.");

    // 1. The round must already be on the network — an at.atjam.submission needs a
    //    round strong-ref. A live round is always backfilled, so absence is exceptional.
    const roundRec = await getRoundRecord(eptssRoundRkey(roundId));
    if (!roundRec) return fail("This round isn't on the network yet — try again shortly.");

    // 2. Resolve the pasted link to the user's own fm.plyr.track, then guard ownership.
    let resolved;
    try {
      resolved = await resolvePlyrUrlToRecord(plyrTrackUrl);
    } catch (e) {
      if (e instanceof PlyrResolveError) return fail(e.message);
      throw e;
    }
    if (resolved.artistDid !== identity.did) {
      return fail("That plyr track belongs to a different account than your linked Bluesky.");
    }

    // The submission's stable rkey is keyed on the Postgres submission id, so we settle
    // an id up front: reuse the user's existing row for this round (a re-submit), else
    // reserve the next one. No write yet — the PDS record goes first.
    const existing = await db
      .select({ id: submissions.id })
      .from(submissions)
      .where(and(eq(submissions.roundId, roundId), eq(submissions.userId, userId)))
      .limit(1);
    let submissionId: number;
    if (existing[0]) {
      submissionId = existing[0].id;
    } else {
      const last = await db.select({ id: submissions.id }).from(submissions).orderBy(desc(submissions.id)).limit(1);
      submissionId = (last[0]?.id ?? 0) + 1;
    }

    const note = str(formData, "note");

    // 3. PDS FIRST — write the submission into the user's repo and prove it resolves,
    //    via the shared writer so claim and submit stay in lockstep.
    let agent;
    try {
      agent = await getUserAgent(identity.did);
    } catch (e) {
      console.error(`[submit-plyr] #${submissionId} session restore failed`, e);
      return fail("Your Bluesky session expired — re-link and submit again.");
    }
    let written: StrongRef;
    try {
      written = await writeSubmissionRecord({
        agent,
        did: identity.did,
        submissionId,
        round: { uri: roundRec.uri, cid: roundRec.cid },
        plyrRef: { uri: resolved.uri, cid: resolved.cid },
        note: note ? clampGraphemes(note, NOTE_MAX_GRAPHEMES) : null,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error(`[submit-plyr] #${submissionId} record write failed`, e);
      return fail("Couldn't write your submission to Bluesky — nothing was saved, please try again.");
    }

    // 4. THEN Postgres — the record exists, so record the row + crosswalk. The long-form
    //    reflections live here; the public record carries only the short caption.
    const projectRow = await db
      .select({ projectId: roundMetadata.projectId })
      .from(roundMetadata)
      .where(eq(roundMetadata.id, roundId))
      .limit(1);
    const projectId = projectRow[0]?.projectId;
    if (!projectId) return fail("Round not found.");

    const additionalComments = JSON.stringify({
      coolThingsLearned: str(formData, "coolThingsLearned") ?? "",
      toolsUsed: str(formData, "toolsUsed") ?? "",
      happyAccidents: str(formData, "happyAccidents") ?? "",
      didntWork: str(formData, "didntWork") ?? "",
    });
    const row = {
      // plyr hosts the audio + cover; keep the URLs for the legacy/display columns.
      audioFileUrl: resolved.audioUrl ?? plyrTrackUrl,
      audioFilePath: null,
      coverImageUrl: resolved.imageUrl,
      coverImagePath: null,
      lyrics: str(formData, "lyrics") ?? null,
      additionalComments,
      // The deliverable lives in the user's repo now; record the crosswalk.
      plyrTrackUri: resolved.uri,
      plyrTrackCid: resolved.cid,
      claimedAtUri: written.uri,
      claimedAt: new Date(),
    };
    if (existing[0]) {
      await db.update(submissions).set(row).where(eq(submissions.id, submissionId));
    } else {
      await db.insert(submissions).values({ id: submissionId, projectId, roundId, userId, ...row });
    }

    console.log(`[submit-plyr] #${submissionId} -> ${written.uri} (payload ${resolved.uri})`);
    revalidatePath("/dashboard");
    return { status: "Success", message: "" };
  } catch (e) {
    console.error("[submit-plyr] failed", e);
    return fail(e instanceof Error ? e.message : "Submission failed. Please try again.");
  }
}
