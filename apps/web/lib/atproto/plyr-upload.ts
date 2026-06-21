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
import {
  EPTSS_DID,
  atUriDid,
  atUriRkey,
  downloadMedia,
  getPlyrTrackRecord,
} from "@eptss/atproto";

const PLYR_TRACK_COLLECTION = "fm.plyr.track";

interface PlyrRef {
  uri: string;
  cid: string;
}

/**
 * The plyr-hosted cover art to carry onto the user's track, drawn from the EPTSS
 * scaffold copy migrate-to-plyr created. plyr's firehose keeps an `imageUrl` only when
 * its origin is plyr's own image host (`images.plyr.fm`), so the scaffold's hosted URL
 * is the one we can reuse — a user-repo or absent pointer has nothing to offer, and any
 * other origin would be stripped on ingest. Best-effort: a scaffold read failure just
 * means no art, never a failed migration.
 */
async function scaffoldCoverArt(plyrTrackUri: string | null): Promise<string | null> {
  if (!plyrTrackUri || atUriDid(plyrTrackUri) !== EPTSS_DID) return null;
  try {
    const track = await getPlyrTrackRecord(EPTSS_DID, atUriRkey(plyrTrackUri));
    return track?.value.imageUrl ?? null;
  } catch {
    return null;
  }
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
 * Land a cover's plyr track in the user's own repo: uploadBlob the audio over their
 * OAuth session, then createRecord the `fm.plyr.track` that references it — carrying the
 * cover art plyr already hosts on the EPTSS scaffold (`plyrTrackUri`), when there is one.
 * Records the pointer at the new track and returns its ref. Null when there's no
 * uploadable audio or the write fails — the cover then keeps its `url`.
 */
export async function ensurePlyrTrackForCover(opts: {
  agent: Agent;
  did: string;
  handle: string | null;
  submissionId: number;
  userId: string;
  /** The cover's current plyr pointer; its EPTSS-scaffold copy is the cover-art source. */
  plyrTrackUri: string | null;
}): Promise<PlyrRef | null> {
  const { agent, did, handle, submissionId, userId, plyrTrackUri } = opts;

  const info = await loadCoverAudio(submissionId, userId);
  if (!info) return null;

  const imageUrl = await scaffoldCoverArt(plyrTrackUri);

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

  // Point at the new user-repo track. NOTE the fracture this creates: `plyr_track_uri`
  // is now overwritten away from the EPTSS scaffold, so the cover-art source (above)
  // survives only until the first migration. The real fix is task #174 — read the
  // deliverable from the submission's `payload` so this column can be purely the
  // art-source. Until then, re-tests need migrate-to-plyr to re-point it at the scaffold.
  await db
    .update(submissions)
    .set({ plyrTrackUri: ref.uri, plyrTrackCid: ref.cid })
    .where(eq(submissions.id, submissionId));
  console.log(`[plyr-upload] #${submissionId} uploaded -> ${ref.uri}`);
  return ref;
}
