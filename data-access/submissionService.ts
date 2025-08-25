"use server";

import { db } from "@/db";
import { submissions, users } from "@/db/schema";
import { Navigation } from "@/enum/navigation";
import { FormReturn } from "@/types";
import { getDataToString, handleResponse } from "@/utils";
import { getAuthUser } from "@/utils/supabase/server";
import { eq, sql } from "drizzle-orm";
import { submissionFormSchema } from "@/lib/schemas/submission";

export const getSubmissions = async (id: number) => {
  const data = await db
    .select({
      created_at: submissions.createdAt,
      round_id: submissions.roundId,
      soundcloud_url: submissions.soundcloudUrl,
      username: users.username || "",
      user_id: submissions.userId,  // Add userId to the selection
    })
    .from(submissions)
    .leftJoin(users, eq(submissions.userId, users.userid))
    .where(eq(submissions.roundId, id));

  return data.map((val) => ({
    createdAt: val.created_at,
    roundId: val.round_id,
    soundcloudUrl: val.soundcloud_url,
    username: val.username || "",
    userId: val.user_id,  // Include userId in the returned object
  }));
};


export async function adminSubmitCover(formData: FormData): Promise<FormReturn> {
  "use server";
  
  try {
    // Extract form data
    const userId = formData.get("userId")?.toString() || "";
    const roundId = Number(formData.get("roundId")?.toString() || "-1");
    const soundcloudUrl = formData.get("soundcloudUrl")?.toString() || "";
    const additionalComments = formData.get("additionalComments")?.toString() || "";
    
    if (!userId) {
      return { status: "Error", message: "User ID is required" };
    }
    
    if (roundId < 0) {
      return { status: "Error", message: "Valid Round ID is required" };
    }
    
    if (!soundcloudUrl) {
      return { status: "Error", message: "SoundCloud URL is required" };
    }
    
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
      roundId: roundId,
      soundcloudUrl: soundcloudUrl,
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
    // Extract form data
    const formDataObj = {
      roundId: Number(formData.get("roundId")?.toString() || "-1"),
      soundcloudUrl: formData.get("soundcloudUrl")?.toString() || "",
      coolThingsLearned: formData.get("coolThingsLearned")?.toString() || "",
      toolsUsed: formData.get("toolsUsed")?.toString() || "",
      happyAccidents: formData.get("happyAccidents")?.toString() || "",
      didntWork: formData.get("didntWork")?.toString() || ""
    };
    
    // Validate with Zod
    const validationResult = submissionFormSchema.safeParse(formDataObj);
    
    if (!validationResult.success) {
      // Format Zod errors into a readable message
      const errorMessages = validationResult.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      return handleResponse(400, Navigation.Submit, errorMessages);
    }
    
    const validData = validationResult.data;
    
    // Get the next submission ID
    const lastSubmissionId = await db
      .select({ id: submissions.id })
      .from(submissions)
      .orderBy(sql`id desc`)
      .limit(1);
    
    const nextSubmissionId = (lastSubmissionId[0]?.id || 0) + 1;

    await db.insert(submissions).values({
      id: nextSubmissionId,
      roundId: validData.roundId,
      soundcloudUrl: validData.soundcloudUrl,
      userId: userId || "",
      additionalComments: JSON.stringify({
        coolThingsLearned: validData.coolThingsLearned || "",
        toolsUsed: validData.toolsUsed || "",
        happyAccidents: validData.happyAccidents || "",
        didntWork: validData.didntWork || "",
      }),
    });
    
    return handleResponse(201, Navigation.Submit, "");
  } catch (error) {
    return handleResponse(500, Navigation.Submit, (error as Error).message);
  }
}
