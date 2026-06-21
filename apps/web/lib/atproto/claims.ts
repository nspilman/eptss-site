/**
 * Phase A of the claim flow — "see yourself in the round."
 * See docs/atproto-migration/claiming-backfilled-submissions.md.
 *
 * Read-only listing of a linked user's EPTSS covers, drawn from the existing
 * Postgres crosswalk: it makes ownership legible — and proves the data is
 * right — *before* any write (Phase B) trusts it. Pure Postgres read; no
 * network, no writes; nothing here encodes an rkey, because Phase A never needs
 * one. (The backfill writer and the read layer share the one encode/decode home
 * in @eptss/atproto/rkey; Phase B will import the encoder from there when it
 * actually writes to the user's repo.)
 *
 * Data-access convention: atproto feature reads query @eptss/db directly from
 * the app/route layer (here, and in app/atproto/...), rather than going through
 * @eptss/core services. These reads are feature-local and co-located with the
 * rest of the atproto plumbing; follow this dialect for atproto code, not the
 * core-services one used elsewhere in the app.
 */
import { db, submissions, signUps, roundMetadata, songs, eq, desc, inArray } from "@eptss/db";
import { listRecordRkeys, eptssSignupId } from "@eptss/atproto";

export interface ClaimableCover {
  /** Postgres submissions.id — the stable identity carried across the move. */
  submissionId: number;
  roundId: number;
  roundSlug: string | null;
  songTitle: string | null;
  songArtist: string | null;
  /** Deliverable: uploaded audio if present, else the legacy SoundCloud link. */
  deliverableUrl: string | null;
  createdAt: Date;
  /** User-repo URI once claimed; null while still on the EPTSS admin scaffold. */
  claimedAtUri: string | null;
  /** This cover's `fm.plyr.track` URI, if re-hosted to plyr — null otherwise. The
   *  URI's DID tells us whether the track is still on the admin scaffold or has
   *  been re-homed to the user's repo (see lib/atproto/plyr-rehome.ts). */
  plyrTrackUri: string | null;
}

/**
 * Every cover this user submitted, newest first, with its round + song and the
 * rkey it maps to on the network. Read-only; safe for any signed-in user.
 */
export async function getClaimableCovers(
  userId: string,
): Promise<ClaimableCover[]> {
  const rows = await db
    .select({
      submissionId: submissions.id,
      roundId: submissions.roundId,
      roundSlug: roundMetadata.slug,
      songTitle: songs.title,
      songArtist: songs.artist,
      audioFileUrl: submissions.audioFileUrl,
      soundcloudUrl: submissions.soundcloudUrl,
      createdAt: submissions.createdAt,
      claimedAtUri: submissions.claimedAtUri,
      plyrTrackUri: submissions.plyrTrackUri,
    })
    .from(submissions)
    .leftJoin(roundMetadata, eq(submissions.roundId, roundMetadata.id))
    .leftJoin(songs, eq(roundMetadata.songId, songs.id))
    .where(eq(submissions.userId, userId))
    .orderBy(desc(submissions.createdAt));

  return rows.map((r) => ({
    submissionId: r.submissionId,
    roundId: r.roundId,
    roundSlug: r.roundSlug,
    songTitle: r.songTitle,
    songArtist: r.songArtist,
    deliverableUrl: r.audioFileUrl ?? r.soundcloudUrl ?? null,
    createdAt: r.createdAt,
    claimedAtUri: r.claimedAtUri,
    plyrTrackUri: r.plyrTrackUri ?? null,
  }));
}

export interface ClaimableSignup {
  /** Postgres sign_ups.id — the stable identity carried across the move. */
  signupId: number;
  roundId: number;
  roundSlug: string | null;
  /** Free-text "additional info" — the only signup field that travels as a note. */
  note: string | null;
  createdAt: Date;
}

/**
 * This user's signups that are NOT yet in their repo. Deliberately song-free: the
 * nominated song (`song_id` / `youtube_link`) is private and never leaves Postgres,
 * so it is not selected here — only the round, timestamp, and free-text note travel.
 *
 * "Already migrated" is read from the repo itself (the `eptss-sig<id>` records the
 * user owns), not from a DB pointer: the repo is the source of truth, so there is
 * no derived state to keep in sync, and a reset that deletes the records makes them
 * eligible again for free. Best-effort — if the repo can't be listed, we fall back
 * to offering all of them (re-migration is an idempotent upsert).
 */
export async function getClaimableSignups(
  userId: string,
  did: string,
): Promise<ClaimableSignup[]> {
  const rows = await db
    .select({
      signupId: signUps.id,
      roundId: signUps.roundId,
      roundSlug: roundMetadata.slug,
      note: signUps.additionalComments,
      createdAt: signUps.createdAt,
    })
    .from(signUps)
    .leftJoin(roundMetadata, eq(signUps.roundId, roundMetadata.id))
    .where(eq(signUps.userId, userId))
    .orderBy(desc(signUps.createdAt));

  let migrated = new Set<number>();
  try {
    const rkeys = await listRecordRkeys(did, "at.atjam.signup");
    for (const rk of rkeys) {
      const id = eptssSignupId(rk);
      if (id != null) migrated.add(id);
    }
  } catch {
    // Couldn't list the repo — offer all; re-migration upserts, so this is safe.
  }

  return rows
    .filter((r) => !migrated.has(r.signupId))
    .map((r) => ({
      signupId: r.signupId,
      roundId: r.roundId,
      roundSlug: r.roundSlug,
      note: r.note,
      createdAt: r.createdAt ?? new Date(0),
    }));
}

/**
 * The claim "location index": for the given submission ids, which have been
 * claimed, and to what user-repo URI? Returned as a plain map so the DB-free
 * read package (`applyClaims`) can re-home claimed records without touching the
 * database. Submissions still on the admin scaffold (`claimed_at_uri` NULL) are
 * simply absent from the map.
 */
export async function getClaimedSubmissionUris(
  submissionIds: number[],
): Promise<Map<number, string>> {
  if (submissionIds.length === 0) return new Map();
  const rows = await db
    .select({ id: submissions.id, claimedAtUri: submissions.claimedAtUri })
    .from(submissions)
    .where(inArray(submissions.id, submissionIds));

  const map = new Map<number, string>();
  for (const r of rows) {
    if (r.claimedAtUri) map.set(r.id, r.claimedAtUri);
  }
  return map;
}
