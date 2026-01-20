"use server";

import { db } from "../db";
import { submissions, users, roundMetadata, songs } from "../db/schema";
import { routes } from "@eptss/routing";
import { FormReturn } from "../types";
import { handleResponse } from "../utils";
import { getAuthUser } from "../utils/supabase/server";
import { eq, sql } from "drizzle-orm";
import { submitCoverSchema } from "../schemas/actionSchemas";
import { validateFormData } from "../utils/formDataHelpers";
import { deleteFile, BUCKETS } from "@eptss/bucket-storage";
import {
  registerPendingUpload,
  commitPendingUpload,
  failPendingUpload,
} from "./uploadTrackingService";
import { MAX_AUDIO_DURATION_SECONDS } from "../utils/serverFileValidation";
import { logger } from "@eptss/logger/server";
import { secondsToMilliseconds } from "../utils/audioDuration";

export const getSubmissions = async (id: number) => {
  const data = await db
    .select({
      created_at: submissions.createdAt,
      round_id: submissions.roundId,
      // Legacy field
      soundcloud_url: submissions.soundcloudUrl,
      // New fields
      audio_file_url: submissions.audioFileUrl,
      cover_image_url: submissions.coverImageUrl,
      audio_duration: submissions.audioDuration,
      audio_file_size: submissions.audioFileSize,
      lyrics: submissions.lyrics,
      username: users.username || "",
      user_id: submissions.userId,
    })
    .from(submissions)
    .leftJoin(users, eq(submissions.userId, users.userid))
    .where(eq(submissions.roundId, id));

  return data.map((val) => ({
    createdAt: val.created_at,
    roundId: val.round_id,
    // Legacy field
    soundcloudUrl: val.soundcloud_url,
    // New fields
    audioFileUrl: val.audio_file_url,
    coverImageUrl: val.cover_image_url,
    audioDuration: val.audio_duration,
    audioFileSize: val.audio_file_size,
    lyrics: val.lyrics,
    username: val.username || "",
    userId: val.user_id,
  }));
};

/**
 * Get a single submission by ID with full details including user and round info
 */
export const getSubmissionById = async (submissionId: number) => {
  const data = await db
    .select({
      id: submissions.id,
      createdAt: submissions.createdAt,
      roundId: submissions.roundId,
      soundcloudUrl: submissions.soundcloudUrl,
      audioFileUrl: submissions.audioFileUrl,
      coverImageUrl: submissions.coverImageUrl,
      audioDuration: submissions.audioDuration,
      audioFileSize: submissions.audioFileSize,
      lyrics: submissions.lyrics,
      additionalComments: submissions.additionalComments,
      userId: submissions.userId,
      username: users.username,
      publicDisplayName: users.publicDisplayName,
      profilePictureUrl: users.profilePictureUrl,
      roundSlug: roundMetadata.slug,
      songTitle: songs.title,
      songArtist: songs.artist,
    })
    .from(submissions)
    .leftJoin(users, eq(submissions.userId, users.userid))
    .leftJoin(roundMetadata, eq(submissions.roundId, roundMetadata.id))
    .leftJoin(songs, eq(roundMetadata.songId, songs.id))
    .where(eq(submissions.id, submissionId))
    .limit(1);

  if (data.length === 0) {
    return null;
  }

  const val = data[0];
  return {
    id: val.id,
    createdAt: val.createdAt,
    roundId: val.roundId,
    soundcloudUrl: val.soundcloudUrl,
    audioFileUrl: val.audioFileUrl,
    coverImageUrl: val.coverImageUrl,
    audioDuration: val.audioDuration,
    audioFileSize: val.audioFileSize,
    lyrics: val.lyrics,
    additionalComments: val.additionalComments,
    userId: val.userId,
    username: val.username || "",
    publicDisplayName: val.publicDisplayName,
    profilePictureUrl: val.profilePictureUrl,
    roundSlug: val.roundSlug,
    songTitle: val.songTitle,
    songArtist: val.songArtist,
  };
};

export type SubmissionDetails = NonNullable<Awaited<ReturnType<typeof getSubmissionById>>>;


export async function adminSubmitCover(formData: FormData): Promise<FormReturn> {
  "use server";

  try {
    // Extract form data
    const userId = formData.get("userId")?.toString() || "";
    const roundId = Number(formData.get("roundId")?.toString() || "-1");
    const audioFileUrl = formData.get("audioFileUrl")?.toString() || "";
    const audioFilePath = formData.get("audioFilePath")?.toString() || "";
    const coverImageUrl = formData.get("coverImageUrl")?.toString();
    const coverImagePath = formData.get("coverImagePath")?.toString();
    const audioDuration = formData.get("audioDuration") ? Number(formData.get("audioDuration")) : undefined;
    const audioFileSize = formData.get("audioFileSize") ? Number(formData.get("audioFileSize")) : undefined;
    const lyrics = formData.get("lyrics")?.toString() || "";
    const additionalComments = formData.get("additionalComments")?.toString() || "";

    if (!userId) {
      return { status: "Error", message: "User ID is required" };
    }

    if (roundId < 0) {
      return { status: "Error", message: "Valid Round ID is required" };
    }

    if (!audioFileUrl || !audioFilePath) {
      return { status: "Error", message: "Audio file is required" };
    }

    // Get the project ID from the round
    const roundResult = await db
      .select({ projectId: roundMetadata.projectId })
      .from(roundMetadata)
      .where(eq(roundMetadata.id, roundId))
      .limit(1);

    if (!roundResult.length) {
      return { status: "Error", message: "Round not found" };
    }

    const projectId = roundResult[0].projectId;

    // Check if user has already submitted for this round
    const existingSubmission = await db
      .select()
      .from(submissions)
      .where(sql`${submissions.userId} = ${userId} AND ${submissions.roundId} = ${roundId}`);

    if (existingSubmission.length > 0) {
      return { status: "Error", message: "User has already submitted for this round" };
    }

    // Get the next submission ID
    const lastSubmissionId = await db
      .select({ id: submissions.id })
      .from(submissions)
      .orderBy(sql`id desc`)
      .limit(1);

    const nextSubmissionId = (lastSubmissionId[0]?.id || 0) + 1;

    await db.insert(submissions).values({
      id: nextSubmissionId,
      projectId: projectId,
      roundId: roundId,
      audioFileUrl: audioFileUrl,
      audioFilePath: audioFilePath,
      coverImageUrl: coverImageUrl || null,
      coverImagePath: coverImagePath || null,
      // Store audio duration in milliseconds for precision
      audioDuration: audioDuration ? secondsToMilliseconds(audioDuration) : null,
      audioFileSize: audioFileSize || null,
      lyrics: lyrics || null,
      userId: userId,
      additionalComments: additionalComments,
    });

    return { status: "Success", message: "Submission added successfully" };
  } catch (error) {
    return { status: "Error", message: (error as Error).message };
  }
}

export async function submitCover(formData: FormData): Promise<FormReturn> {
  "use server";
  const { userId } = await getAuthUser();

  // Track pending upload IDs for two-phase commit
  let audioUploadId: string | null = null;
  let imageUploadId: string | null = null;

  try {
    // Validate form data with Zod
    const validation = validateFormData(formData, submitCoverSchema);

    if (!validation.success) {
      return handleResponse(400, routes.dashboard.root(), validation.error);
    }

    const validData = validation.data;

    // Get the project ID from the round
    const roundResult = await db
      .select({ projectId: roundMetadata.projectId })
      .from(roundMetadata)
      .where(eq(roundMetadata.id, validData.roundId))
      .limit(1);

    if (!roundResult.length) {
      // Clean up uploaded files if round not found
      await deleteFile(BUCKETS.AUDIO_SUBMISSIONS, validData.audioFilePath).catch(() => {});
      if (validData.coverImagePath) {
        await deleteFile(BUCKETS.SUBMISSION_IMAGES, validData.coverImagePath).catch(() => {});
      }
      return handleResponse(404, routes.dashboard.root(), "Round not found");
    }

    const projectId = roundResult[0].projectId;

    // Get the next submission ID
    const lastSubmissionId = await db
      .select({ id: submissions.id })
      .from(submissions)
      .orderBy(sql`id desc`)
      .limit(1);

    const nextSubmissionId = (lastSubmissionId[0]?.id || 0) + 1;

    // PHASE 1: Register pending uploads
    // This creates tracking records for uploaded files before DB commit
    const audioUploadResult = await registerPendingUpload({
      bucket: BUCKETS.AUDIO_SUBMISSIONS,
      filePath: validData.audioFilePath,
      fileUrl: validData.audioFileUrl,
      uploadedBy: userId,
      relatedTable: "submissions",
      relatedId: String(nextSubmissionId),
      metadata: {
        roundId: validData.roundId,
        audioDuration: validData.audioDuration,
        audioFileSize: validData.audioFileSize,
      },
      expiresInHours: 24, // Files will be auto-cleaned after 24 hours if not committed
    });

    if (audioUploadResult.error) {
      console.error("[submitCover] Failed to register audio upload:", audioUploadResult.error);
      // Continue anyway - tracking is best effort
    } else {
      audioUploadId = audioUploadResult.id;
    }

    if (validData.coverImagePath) {
      const imageUploadResult = await registerPendingUpload({
        bucket: BUCKETS.SUBMISSION_IMAGES,
        filePath: validData.coverImagePath,
        fileUrl: validData.coverImageUrl,
        uploadedBy: userId,
        relatedTable: "submissions",
        relatedId: String(nextSubmissionId),
        metadata: {
          roundId: validData.roundId,
        },
        expiresInHours: 24,
      });

      if (imageUploadResult.error) {
        console.error("[submitCover] Failed to register image upload:", imageUploadResult.error);
        // Continue anyway - tracking is best effort
      } else {
        imageUploadId = imageUploadResult.id;
      }
    }

    // PHASE 2: Attempt to insert submission into database
    try {
      // Validate and convert audio duration with sanity check
      let audioDurationMs: number | null = null;
      if (validData.audioDuration) {
        if (validData.audioDuration <= 0) {
          logger.warn("Invalid audio duration (≤ 0), storing as null", {
            duration: validData.audioDuration,
            userId,
          });
        } else if (validData.audioDuration > MAX_AUDIO_DURATION_SECONDS) {
          logger.warn("Audio duration exceeds maximum, storing as null", {
            duration: validData.audioDuration,
            maxDuration: MAX_AUDIO_DURATION_SECONDS,
            userId,
          });
        } else {
          // Valid duration - convert to milliseconds
          audioDurationMs = secondsToMilliseconds(validData.audioDuration);
        }
      }

      await db.insert(submissions).values({
        id: nextSubmissionId,
        projectId: projectId,
        roundId: validData.roundId,
        audioFileUrl: validData.audioFileUrl,
        audioFilePath: validData.audioFilePath,
        coverImageUrl: validData.coverImageUrl || null,
        coverImagePath: validData.coverImagePath || null,
        // Store audio duration in milliseconds for precision (input is in seconds)
        audioDuration: audioDurationMs,
        audioFileSize: validData.audioFileSize || null,
        lyrics: validData.lyrics || null,
        userId: userId || "",
        additionalComments: JSON.stringify({
          coolThingsLearned: validData.coolThingsLearned || "",
          toolsUsed: validData.toolsUsed || "",
          happyAccidents: validData.happyAccidents || "",
          didntWork: validData.didntWork || "",
        }),
      });

      // SUCCESS: Mark uploads as committed
      if (audioUploadId) {
        await commitPendingUpload(audioUploadId).catch((err) =>
          console.error("[submitCover] Failed to commit audio upload:", err)
        );
      }
      if (imageUploadId) {
        await commitPendingUpload(imageUploadId).catch((err) =>
          console.error("[submitCover] Failed to commit image upload:", err)
        );
      }

      return handleResponse(201, routes.dashboard.root(), "");
    } catch (dbError) {
      // FAILURE: Mark uploads as failed and clean up files
      console.error("[submitCover] Database insert failed:", dbError);

      if (audioUploadId) {
        await failPendingUpload(audioUploadId).catch(() => {});
      }
      if (imageUploadId) {
        await failPendingUpload(imageUploadId).catch(() => {});
      }

      // Clean up uploaded files immediately (don't wait for cron job)
      await deleteFile(BUCKETS.AUDIO_SUBMISSIONS, validData.audioFilePath).catch(() => {});
      if (validData.coverImagePath) {
        await deleteFile(BUCKETS.SUBMISSION_IMAGES, validData.coverImagePath).catch(() => {});
      }

      throw dbError;
    }
  } catch (error) {
    return handleResponse(500, routes.dashboard.root(), (error as Error).message);
  }
}
