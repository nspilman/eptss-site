"use server";

/**
 * In-app plyr re-home — moving a cover's `fm.plyr.track` from the EPTSS admin
 * scaffold into the signed-in user's own repo, with the user OAuth'd as
 * themselves. See docs/atproto-migration/claiming-plyr-tracks.md.
 *
 * Strategy (record duplication, not re-upload): the admin's track record is
 * copied into the user's repo carrying plyr's R2 `audioUrl` (repo-independent —
 * it streams the same whoever holds the record) and the metadata. The admin-repo
 * `audioBlob` is intentionally NOT carried: re-hosting a blob would need a broader
 * (blob) OAuth grant, and the R2 URL is the playable source plyr itself serves.
 *
 * Reversible: `rehomePlyrTrack` only writes the user's repo + repoints the
 * Postgres pointer; the admin custodian copy is left intact. `undoRehomePlyrTrack`
 * repoints back and removes the user copy. The irreversible removal of the admin
 * copy is a separate, admin-authority step (the migration script's purge) — the
 * web app deliberately holds no admin credentials.
 *
 * Verified (June 2026): plyr's firehose indexer re-attributes the duplicated record
 * to the user's DID — the new track comes back `audio_storage: r2` with a real
 * `r2_url`, after a short indexing lag — so the branded embed resolves under their
 * DID. The audio never moves; the record just points at the R2 object the admin's
 * migration already created. (No plyr token, no re-upload, no `audioBlob` needed.)
 */
import { revalidatePath } from "next/cache";
import { getAuthUser } from "@eptss/auth/server";
import { loadIdentity } from "@eptss/auth/atproto";
import { db, submissions, eq, and } from "@eptss/db";
import { EPTSS_DID, getPlyrTrackRecord } from "@eptss/atproto";
import { getUserAgent } from "./agent";
import {
  PLYR_TRACK_COLLECTION,
  adminPlyrUri,
  plyrOwnership,
  rkeyOfUri,
} from "./plyr-rehome";

export interface PlyrRehomeResult {
  ok: boolean;
  error?: string;
  /** The track's URI after the action (user-repo on move, admin on undo). */
  uri?: string;
  /** The PDS refused the write for lack of scope — the user must re-link first. */
  needsRelink?: boolean;
  /** True when PLYR_REHOME_DRY_RUN is set — verified the path but wrote nothing. */
  dryRun?: boolean;
}

/**
 * Dry-run guard. With PLYR_REHOME_DRY_RUN=1, `rehomePlyrTrack` runs every step up
 * to (but not including) the write: it still reads the admin record, builds the
 * copy, and restores the OAuth session, then logs the plan and returns without
 * touching the user's repo or Postgres. It does NOT prove the scope permits the
 * write or that plyr re-attributes — only the real (reversible) run does.
 */
function isDryRun(): boolean {
  const v = process.env.PLYR_REHOME_DRY_RUN;
  return v === "1" || v === "true";
}

/** Confirm the cover belongs to this user and return its current plyr pointer. */
async function loadOwnedTrack(
  submissionId: number,
  userId: string,
): Promise<{ plyrTrackUri: string | null } | null> {
  const rows = await db
    .select({ plyrTrackUri: submissions.plyrTrackUri })
    .from(submissions)
    .where(and(eq(submissions.id, submissionId), eq(submissions.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

/** Heuristic: does this look like the PDS rejecting the write for lack of scope? */
function looksLikeScopeError(err: unknown): boolean {
  const m = err instanceof Error ? err.message : String(err);
  return /scope|forbidden|insufficient|not permitted|invalidtoken|bad token/i.test(m);
}

/**
 * Re-home one cover's plyr track into the signed-in user's repo. Idempotent:
 * a track already on the user's repo returns success without rewriting.
 */
export async function rehomePlyrTrack(
  submissionId: number,
): Promise<PlyrRehomeResult> {
  try {
    const { userId } = await getAuthUser();
    if (!userId) return { ok: false, error: "Not signed in." };

    const identity = await loadIdentity(userId);
    if (!identity) return { ok: false, error: "Link your Bluesky account first." };

    const owned = await loadOwnedTrack(submissionId, userId);
    if (!owned) return { ok: false, error: "That cover isn't yours to move." };

    const state = plyrOwnership(owned.plyrTrackUri, identity.did);
    if (state === "none") {
      return { ok: false, error: "This cover has no plyr track to move." };
    }
    if (state === "mine") {
      return { ok: true, uri: owned.plyrTrackUri ?? undefined }; // already moved
    }

    const rkey = rkeyOfUri(owned.plyrTrackUri!);
    const source = await getPlyrTrackRecord(EPTSS_DID, rkey);
    if (!source) {
      return { ok: false, error: "The EPTSS plyr track record wasn't found." };
    }

    // Build the user's copy: R2 `audioUrl` + metadata, `artist` re-stamped to the
    // claimer, `audioBlob` dropped (repo-scoped; see file header).
    const v = source.value;
    const record: Record<string, unknown> = {
      $type: PLYR_TRACK_COLLECTION,
      title: v.title,
      artist: identity.handle ?? v.artist,
      audioUrl: v.audioUrl,
      duration: v.duration,
      fileType: v.fileType,
      imageUrl: v.imageUrl,
      createdAt: v.createdAt ?? new Date().toISOString(),
    };
    for (const k of Object.keys(record)) {
      if (record[k] === undefined) delete record[k];
    }

    let agent;
    try {
      agent = await getUserAgent(identity.did);
    } catch (err) {
      console.error(`[plyr-rehome] #${submissionId} session restore failed`, err);
      return {
        ok: false,
        needsRelink: true,
        error: "Your Bluesky session expired — re-link to move.",
      };
    }

    // DRY RUN: everything verified up to here (ownership, admin record, the
    // constructed copy, a live OAuth session) — but write nothing.
    if (isDryRun()) {
      const plannedUri = `at://${identity.did}/${PLYR_TRACK_COLLECTION}/${rkey}`;
      console.log(
        `[plyr-rehome] DRY RUN #${submissionId} — no write performed\n` +
          `  source : ${source.uri} (${source.cid})\n` +
          `  target : ${plannedUri}\n` +
          `  record : ${JSON.stringify(record)}`,
      );
      return { ok: true, uri: plannedUri, dryRun: true };
    }

    let put;
    try {
      put = await agent.com.atproto.repo.putRecord({
        repo: identity.did,
        collection: PLYR_TRACK_COLLECTION,
        rkey,
        record,
      });
    } catch (err) {
      console.error(`[plyr-rehome] #${submissionId} putRecord failed`, err);
      if (looksLikeScopeError(err)) {
        return {
          ok: false,
          needsRelink: true,
          error:
            "Your Bluesky link doesn't allow plyr tracks yet — re-link to grant access, then try again.",
        };
      }
      const message = err instanceof Error ? err.message : "unknown error";
      return { ok: false, error: `Move failed: ${message}` };
    }

    // Prove the new home resolves before we repoint to it.
    await agent.com.atproto.repo.getRecord({
      repo: identity.did,
      collection: PLYR_TRACK_COLLECTION,
      rkey,
    });

    // Repoint the pointer. The admin custodian copy stays intact as a backup.
    await db
      .update(submissions)
      .set({ plyrTrackUri: put.data.uri, plyrTrackCid: put.data.cid })
      .where(eq(submissions.id, submissionId));

    revalidatePath("/dashboard/profile");
    console.log(`[plyr-rehome] #${submissionId} -> ${put.data.uri}`);
    return { ok: true, uri: put.data.uri };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(`[plyr-rehome] #${submissionId} FAILED:`, err);
    return { ok: false, error: `Move failed: ${message}` };
  }
}

/**
 * Reverse a re-home: repoint the pointer back to the admin custodian copy (still
 * intact) and best-effort delete the user-repo copy. Nothing on the admin side
 * was touched, so the cover reverts cleanly.
 */
export async function undoRehomePlyrTrack(
  submissionId: number,
): Promise<PlyrRehomeResult> {
  try {
    const { userId } = await getAuthUser();
    if (!userId) return { ok: false, error: "Not signed in." };

    const identity = await loadIdentity(userId);
    if (!identity) return { ok: false, error: "Link your Bluesky account first." };

    const owned = await loadOwnedTrack(submissionId, userId);
    if (!owned) return { ok: false, error: "That cover isn't yours." };

    const state = plyrOwnership(owned.plyrTrackUri, identity.did);
    if (state !== "mine") {
      return { ok: true, uri: owned.plyrTrackUri ?? undefined }; // nothing to undo
    }

    const rkey = rkeyOfUri(owned.plyrTrackUri!);
    const adminUri = adminPlyrUri(rkey);
    // Restore the pointer to the admin copy (re-read it to restore its cid too).
    const adminRec = await getPlyrTrackRecord(EPTSS_DID, rkey);
    await db
      .update(submissions)
      .set({ plyrTrackUri: adminUri, plyrTrackCid: adminRec?.cid ?? null })
      .where(eq(submissions.id, submissionId));

    // Best-effort cleanup of the user-repo copy; the pointer is already reverted.
    try {
      const agent = await getUserAgent(identity.did);
      await agent.com.atproto.repo.deleteRecord({
        repo: identity.did,
        collection: PLYR_TRACK_COLLECTION,
        rkey,
      });
    } catch (err) {
      console.warn(`[plyr-rehome] #${submissionId} undo cleanup skipped`, err);
    }

    revalidatePath("/dashboard/profile");
    return { ok: true, uri: adminUri };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error(`[plyr-rehome] #${submissionId} undo FAILED:`, err);
    return { ok: false, error: `Undo failed: ${message}` };
  }
}
