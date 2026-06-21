/**
 * Create a cover's plyr track from the web app — OAuth only, the way plyr is meant to
 * be fed (mirrors Nate's atproto-learn /track route): `uploadBlob` the audio into the
 * USER's own PDS, then `createRecord` an `fm.plyr.track` that references it. plyr's
 * firehose indexer discovers the record, downloads the blob, transcodes it, and renders
 * it — we never call plyr's API and need no plyr token. The track is the user's from the
 * moment it's written, so there's nothing to re-home.
 *
 * Authority is the user's own atproto OAuth session (getUserAgent), under the
 * `fm.plyr.track` repo scope the link already grants — uploadBlob + createRecord to
 * one's own repo need nothing more. Best-effort: a cover with no uploadable audio file,
 * or any write failure, returns null and the caller keeps the cover's raw `url`. Not a
 * "use server" module — an internal helper the claim server action composes.
 */
import type { Agent } from "@atproto/api";
import { db, submissions, roundMetadata, songs, eq, and } from "@eptss/db";
import { downloadMedia } from "@eptss/atproto";

const PLYR_TRACK_COLLECTION = "fm.plyr.track";

interface PlyrRef {
  uri: string;
  cid: string;
}

/** The cover's uploadable audio + the metadata the track record needs, or null. */
async function loadCoverAudio(
  submissionId: number,
  userId: string,
): Promise<{ audioUrl: string; title: string } | null> {
  const rows = await db
    .select({
      audioFileUrl: submissions.audioFileUrl,
      songTitle: songs.title,
    })
    .from(submissions)
    .leftJoin(roundMetadata, eq(submissions.roundId, roundMetadata.id))
    .leftJoin(songs, eq(roundMetadata.songId, songs.id))
    .where(and(eq(submissions.id, submissionId), eq(submissions.userId, userId)))
    .limit(1);
  const r = rows[0];
  // Only an uploaded audio FILE is re-hostable; a SoundCloud link isn't a media file.
  if (!r?.audioFileUrl) return null;
  return { audioUrl: r.audioFileUrl, title: r.songTitle ?? `EPTSS cover #${submissionId}` };
}

/** The track's fileType, from the audio URL's extension (e.g. "mp3"). */
function fileTypeOf(url: string): string {
  return url.split("/").pop()?.split("?")[0]?.split(".").pop()?.toLowerCase() || "mp3";
}

/**
 * Ensure a cover that has no plyr track gets one, written straight into the user's own
 * repo via their OAuth session: uploadBlob the audio, then createRecord the
 * `fm.plyr.track` that references it. Records the pointer and returns the ref. Null when
 * there's nothing to upload or the write couldn't be made — the cover then keeps its `url`.
 */
export async function ensurePlyrTrackForCover(opts: {
  agent: Agent;
  did: string;
  handle: string | null;
  submissionId: number;
  userId: string;
  /**
   * A plyr-hosted cover-art URL (images.plyr.fm) to carry onto the record. plyr's
   * firehose only keeps an `imageUrl` whose origin is plyr's own image host, so this
   * must be a URL plyr already hosts — typically the one migrate-to-plyr put on the
   * EPTSS scaffold track. Any other origin would be stripped on ingest, so we omit it.
   */
  imageUrl?: string | null;
}): Promise<PlyrRef | null> {
  const { agent, did, handle, submissionId, userId, imageUrl } = opts;

  const info = await loadCoverAudio(submissionId, userId);
  if (!info) return null;

  let ref: PlyrRef;
  try {
    const file = await downloadMedia(info.audioUrl);

    // 1. The audio lives in the user's repo as an unreferenced blob until a record
    //    points at it (the PDS GCs it otherwise).
    const uploaded = await agent.com.atproto.repo.uploadBlob(file.bytes, {
      encoding: file.mimeType,
    });

    // 2. The fm.plyr.track record references the blob; plyr's firehose does the rest.
    const record: Record<string, unknown> = {
      $type: PLYR_TRACK_COLLECTION,
      title: info.title,
      artist: handle ?? "EPTSS",
      audioBlob: uploaded.data.blob,
      fileType: fileTypeOf(info.audioUrl),
      createdAt: new Date().toISOString(),
    };
    // Carry the cover art when plyr already hosts it (anything else is stripped).
    if (imageUrl) record.imageUrl = imageUrl;
    const created = await agent.com.atproto.repo.createRecord({
      repo: did,
      collection: PLYR_TRACK_COLLECTION,
      record,
    });
    ref = { uri: created.data.uri, cid: created.data.cid };
  } catch (err) {
    console.error(`[plyr-upload] #${submissionId} upload failed`, err);
    return null;
  }

  await db
    .update(submissions)
    .set({ plyrTrackUri: ref.uri, plyrTrackCid: ref.cid })
    .where(eq(submissions.id, submissionId));
  console.log(`[plyr-upload] #${submissionId} uploaded -> ${ref.uri}`);
  return ref;
}
