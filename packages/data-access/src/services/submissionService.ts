"use server";

import { db } from "../db";
import { submissions, users, roundMetadata } from "../db/schema";
import { routes } from "@eptss/routing";
import { FormReturn } from "../types";
import { handleResponse } from "../utils";
import { getAuthUser } from "../utils/supabase/server";
import { eq, sql } from "drizzle-orm";
import { submissionFormSchema } from "../schemas/submission";
import { validateFormData } from "../utils/formDataHelpers";
import { deleteFile, BUCKETS } from "@eptss/bucket-storage";

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
    username: val.username || "",
    userId: val.user_id,
  }));
};


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
      audioDuration: audioDuration || null,
      audioFileSize: audioFileSize || null,
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

  try {
    // Validate form data with Zod
    const validation = validateFormData(formData, submissionFormSchema);

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

    // Attempt to insert submission
    try {
      await db.insert(submissions).values({
        id: nextSubmissionId,
        projectId: projectId,
        roundId: validData.roundId,
        audioFileUrl: validData.audioFileUrl,
        audioFilePath: validData.audioFilePath,
        coverImageUrl: validData.coverImageUrl || null,
        coverImagePath: validData.coverImagePath || null,
        audioDuration: validData.audioDuration || null,
        audioFileSize: validData.audioFileSize || null,
        userId: userId || "",
        additionalComments: JSON.stringify({
          coolThingsLearned: validData.coolThingsLearned || "",
          toolsUsed: validData.toolsUsed || "",
          happyAccidents: validData.happyAccidents || "",
          didntWork: validData.didntWork || "",
        }),
      });

      return handleResponse(201, routes.dashboard.root(), "");
    } catch (dbError) {
      // Clean up uploaded files if database insert fails
      await deleteFile("audio-submissions", validData.audioFilePath).catch(() => {});
      if (validData.coverImagePath) {
        await deleteFile("submission-images", validData.coverImagePath).catch(() => {});
      }
      throw dbError;
    }
  } catch (error) {
    return handleResponse(500, routes.dashboard.root(), (error as Error).message);
  }
}
