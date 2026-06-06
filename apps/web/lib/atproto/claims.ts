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
import { db, submissions, roundMetadata, songs, eq, desc } from "@eptss/db";

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
  }));
}
