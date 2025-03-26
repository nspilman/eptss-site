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
      username: users.username || "",  // Add this line to get username
    })
    .from(submissions)
    .leftJoin(users, eq(submissions.userId, users.userid))  // Add this line to join with users table
    .where(eq(submissions.roundId, id));

  return data.map((val) => ({
    createdAt: val.created_at,
    roundId: val.round_id,
    soundcloudUrl: val.soundcloud_url,
    username: val.username || "",  // Add this to the return object
  }));
};


export async function submitCover(formData: FormData): Promise<FormReturn> {
  "use server";
  const { userId } = getAuthUser();
  
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
