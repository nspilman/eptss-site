/**
 * Create a cover's plyr track from the web app — the "upload when it doesn't exist
 * yet" half of the migration. This is the EPTSS-specific glue around the shared plyr
 * upload client (@eptss/atproto): it finds the cover's audio, runs it through plyr as
 * EPTSS (the server-side PLYR_TOKEN), and records the resulting scaffold pointer so the
 * migration's next step (ensurePlyrTrackOwned) can re-home it into the user's repo.
 *
 * plyr exposes no third-party relying-party OAuth, so the upload is authored by EPTSS;
 * the track lands on the EPTSS repo and is re-homed — the same shape the migrate-to-plyr
 * script produced. Best-effort: no PLYR_TOKEN, no uploadable audio file, or any plyr
 * error returns null and the caller keeps the cover's raw `url`. Not a "use server"
 * module — an internal helper the claim server action composes.
 */
import { db, submissions, roundMetadata, songs, eq, and } from "@eptss/db";
import { downloadMedia, uploadAudioToPlyr } from "@eptss/atproto";

interface PlyrRef {
  uri: string;
  cid: string;
}

/** The cover's uploadable audio + the metadata plyr needs, or null if there's no file. */
async function loadCoverAudio(
  submissionId: number,
  userId: string,
): Promise<{ audioUrl: string; title: string; imageUrl: string | null } | null> {
  const rows = await db
    .select({
      audioFileUrl: submissions.audioFileUrl,
      coverImageUrl: submissions.coverImageUrl,
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
  return {
    audioUrl: r.audioFileUrl,
    title: r.songTitle ?? `EPTSS cover #${submissionId}`,
    imageUrl: r.coverImageUrl,
  };
}

/**
 * Ensure a cover that has no plyr track gets one: upload its audio to plyr (as EPTSS),
 * record the resulting scaffold pointer on the submission, and return the ref so the
 * caller can re-home it into the user's repo. Null when there's nothing to upload or
 * the upload couldn't be made — the cover then migrates with its raw `url`.
 */
export async function ensurePlyrTrackForCover(
  submissionId: number,
  userId: string,
): Promise<PlyrRef | null> {
  const token = process.env.PLYR_TOKEN;
  if (!token) {
    console.warn("[plyr-upload] PLYR_TOKEN not set — cannot create a plyr track");
    return null;
  }

  const info = await loadCoverAudio(submissionId, userId);
  if (!info) return null;

  let ref: PlyrRef;
  try {
    const file = await downloadMedia(info.audioUrl);
    // A broken/missing cover image is non-fatal — the audio still uploads.
    let image;
    if (info.imageUrl) {
      try {
        image = await downloadMedia(info.imageUrl);
      } catch (err) {
        console.warn("[plyr-upload] cover art download failed (continuing)", err);
      }
    }
    ref = await uploadAudioToPlyr({ token, file, title: info.title, image });
  } catch (err) {
    console.error(`[plyr-upload] #${submissionId} upload failed`, err);
    return null;
  }

  // The track is on the EPTSS scaffold (uploaded as EPTSS); record the pointer so the
  // re-home step (ensurePlyrTrackOwned) moves it into the user's repo next.
  await db
    .update(submissions)
    .set({ plyrTrackUri: ref.uri, plyrTrackCid: ref.cid })
    .where(eq(submissions.id, submissionId));
  console.log(`[plyr-upload] #${submissionId} uploaded -> ${ref.uri}`);
  return ref;
}
