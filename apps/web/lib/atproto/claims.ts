/**
 * Phase A of the claim flow — "see yourself in the round."
 * See docs/atproto-migration/claiming-backfilled-submissions.md.
 *
 * Read-only listing of a linked user's EPTSS covers: the submissions that today
 * live on the EPTSS admin PDS and that, as claiming rolls out, will become
 * movable into the user's own repo. This phase makes the existing crosswalk
 * visible and proves the data is right *before* any write trusts it.
 *
 * Pure Postgres read — no network, no writes. The rkey each cover is backfilled
 * under (`eptss-sub<id>`) is derived here so every later phase shares one stable
 * identity scheme (matches `eptssSubmissionId` in @eptss/atproto).
 */
import { db, submissions, roundMetadata, songs, eq, desc } from "@eptss/db";

export interface ClaimableCover {
  /** Postgres submissions.id — the stable identity carried across the move. */
  submissionId: number;
  /** The rkey this cover is backfilled under on the admin PDS (and keeps when claimed). */
  eptssRkey: string;
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
    eptssRkey: `eptss-sub${r.submissionId}`,
    roundId: r.roundId,
    roundSlug: r.roundSlug,
    songTitle: r.songTitle,
    songArtist: r.songArtist,
    deliverableUrl: r.audioFileUrl ?? r.soundcloudUrl ?? null,
    createdAt: r.createdAt,
  }));
}
