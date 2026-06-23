/**
 * Create a cover's plyr track from the web app — OAuth only, the way plyr is meant to be
 * fed: `uploadBlob` the audio into the USER's own PDS, then `createRecord` an
 * `fm.plyr.track` that references it. We never call plyr's API and need no plyr token.
 *
 * The record is written "both"-storage, the shape the fm.plyr.track lexicon intends
 * (audioBlob is the canonical source; audioUrl is the CDN fallback):
 *   - audioBlob — the audio bytes, now living in the USER's repo (self-custody)
 *   - audioUrl  — the EXISTING plyr R2 object, carried from the EPTSS scaffold record, so
 *                 plyr serves clean R2 playback. This is load-bearing: plyr's firehose does
 *                 NOT transcode a PDS blob to R2, so a blob-only record stays
 *                 audio_storage="pds" with no r2_url and a NaN:NaN embed. Pointing at the
 *                 R2 copy the admin's migration already made gets audio_storage="both".
 *   - duration  — carried from the scaffold record so the embed shows a real time.
 *   - imageUrl  — the plyr-hosted (images.plyr.fm) cover from plyr_cover_image_url, the only
 *                 image origin plyr's ingester trusts (anything else is stripped on ingest).
 *
 * Authority is the user's own atproto OAuth session (getUserAgent), under the
 * `fm.plyr.track` repo scope the link already grants. Best-effort: a cover with no
 * uploadable audio file, or any write failure, returns null and the caller keeps the
 * cover's raw `url`. Not a "use server" module — an internal helper the claim action composes.
 */
import type { Agent } from "@atproto/api";
import { db, submissions, roundMetadata, songs, eq, and } from "@eptss/db";
import {
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

/** The cover's source audio + title, the plyr-hosted cover art, and the scaffold plyr
 *  track pointer (where the R2 url + duration are harvested) — or null when not re-hostable. */
async function loadCoverAudio(
  submissionId: number,
  userId: string,
): Promise<{
  sourceAudioUrl: string;
  title: string;
  imageUrl: string | null;
  plyrTrackUri: string | null;
} | null> {
  const rows = await db
    .select({
      audioFileUrl: submissions.audioFileUrl,
      songTitle: songs.title,
      // The plyr-hosted (images.plyr.fm) cover, minted by migrate-to-plyr — the only
      // image origin plyr's ingester trusts, so the one we can carry onto the user's
      // track. A stable column, not read off plyr_track_uri (which the claim overwrites).
      plyrCoverImageUrl: submissions.plyrCoverImageUrl,
      // The scaffold fm.plyr.track: its R2 audioUrl + duration ride onto the user's copy
      // so plyr serves R2 playback (it never transcodes a bare PDS blob).
      plyrTrackUri: submissions.plyrTrackUri,
    })
    .from(submissions)
    .leftJoin(roundMetadata, eq(submissions.roundId, roundMetadata.id))
    .leftJoin(songs, eq(roundMetadata.songId, songs.id))
    .where(and(eq(submissions.id, submissionId), eq(submissions.userId, userId)))
    .limit(1);
  const r = rows[0];
  // Only an uploaded audio FILE is re-hostable; a SoundCloud link isn't a media file.
  if (!r?.audioFileUrl) return null;
  return {
    sourceAudioUrl: r.audioFileUrl,
    title: r.songTitle ?? `EPTSS cover #${submissionId}`,
    imageUrl: r.plyrCoverImageUrl ?? null,
    plyrTrackUri: r.plyrTrackUri ?? null,
  };
}

/** The track's fileType, from the audio URL's extension (e.g. "mp3"). */
function fileTypeOf(url: string): string {
  return url.split("/").pop()?.split("?")[0]?.split(".").pop()?.toLowerCase() || "mp3";
}

/**
 * Harvest the existing plyr R2 url + duration off the cover's scaffold fm.plyr.track, so
 * the user's copy can carry them (R2 playback + a real embed duration). Read at the
 * pointer's own repo — works whether it still sits on the EPTSS scaffold or was already
 * re-homed; the R2 object is the same either way. Best-effort: a missing pointer/record
 * just yields nulls, and the user's copy falls back to a blob-only ("pds") record.
 */
async function loadScaffoldPlayback(
  plyrTrackUri: string | null,
): Promise<{ r2Url: string | null; duration: number | null }> {
  const did = atUriDid(plyrTrackUri);
  if (!plyrTrackUri || !did) return { r2Url: null, duration: null };
  const rec = await getPlyrTrackRecord(did, atUriRkey(plyrTrackUri));
  return {
    r2Url: rec?.value.audioUrl ?? null,
    duration: typeof rec?.value.duration === "number" ? rec.value.duration : null,
  };
}

/**
 * Land a cover's plyr track in the user's own repo: uploadBlob the audio over their OAuth
 * session, then createRecord the `fm.plyr.track` referencing it — carrying the existing R2
 * url + duration (audio_storage="both", clean playback) and the plyr-hosted cover art.
 * Records the pointer at the new track and returns its ref. Null when there's no uploadable
 * audio or the write fails — the cover then keeps its `url`.
 */
export async function ensurePlyrTrackForCover(opts: {
  agent: Agent;
  did: string;
  handle: string | null;
  submissionId: number;
  userId: string;
}): Promise<PlyrRef | null> {
  const { agent, did, handle, submissionId, userId } = opts;

  const info = await loadCoverAudio(submissionId, userId);
  if (!info) return null;

  // Harvest the R2 url + duration the admin's migration already produced, so the user's
  // copy plays from R2 (plyr won't transcode a bare PDS blob) with a real embed time.
  const playback = await loadScaffoldPlayback(info.plyrTrackUri);

  let ref: PlyrRef;
  try {
    const file = await downloadMedia(info.sourceAudioUrl);

    // 1. The audio lives in the user's repo as an unreferenced blob until a record
    //    points at it (the PDS GCs it otherwise).
    const uploaded = await agent.com.atproto.repo.uploadBlob(file.bytes, {
      encoding: file.mimeType,
    });

    // 2. The fm.plyr.track record: the user's PDS blob is the canonical source, with the
    //    existing R2 url as the CDN fallback plyr serves; duration + cover art ride along.
    const record: Record<string, unknown> = {
      $type: PLYR_TRACK_COLLECTION,
      title: info.title,
      artist: handle ?? "EPTSS",
      audioBlob: uploaded.data.blob,
      fileType: fileTypeOf(info.sourceAudioUrl),
      createdAt: new Date().toISOString(),
    };
    // Carry the R2 url (audio_storage="both") so plyr serves clean playback. Only plyr's
    // own R2 origin is trusted on ingest, which is exactly what the scaffold record holds.
    if (playback.r2Url) record.audioUrl = playback.r2Url;
    // A real duration keeps the embed off NaN:NaN.
    if (playback.duration != null) record.duration = playback.duration;
    // Carry the cover art when plyr already hosts it (anything else is stripped on ingest).
    if (info.imageUrl) record.imageUrl = info.imageUrl;

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

  // Point at the new user-repo track. This overwrites the prior plyr_track_uri (the
  // embed/ownership pointer); the cover art is unaffected — it lives in its own
  // plyr_cover_image_url column, not on this record. Retiring the pointer's double duty
  // as the live-embed source is task #174 (read the deliverable from `payload`).
  await db
    .update(submissions)
    .set({ plyrTrackUri: ref.uri, plyrTrackCid: ref.cid })
    .where(eq(submissions.id, submissionId));
  console.log(
    `[plyr-upload] #${submissionId} uploaded -> ${ref.uri} (${playback.r2Url ? "both" : "pds"})`,
  );
  return ref;
}
