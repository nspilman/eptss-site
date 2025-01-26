"use server";

import { db } from "@/db";
import { submissions, users } from "@/db/schema";
import { Navigation } from "@/enum/navigation";
import { FormReturn } from "@/types";
import { getDataToString, handleResponse } from "@/utils";
import { getAuthUser } from "@/utils/supabase/server";
import { eq, sql } from "drizzle-orm";

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
  const getToString = (key: string) => getDataToString(formData, key);
  const { userId } = getAuthUser();
  
  try {
    const data = await db
      .select({
        created_at: submissions.createdAt,
        round_id: submissions.roundId,
        soundcloud_url: submissions.soundcloudUrl,
        username: users.username,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.userId, users.userid))
      .where(eq(submissions.id, sql`nextval('submissions_id_seq')`));

    await db.insert(submissions).values({
      id: sql`nextval('submissions_id_seq')`,
      roundId: JSON.parse(getToString("roundId") || "-1"),
      soundcloudUrl: getToString("soundcloudUrl") || "",
      userId: userId || "",
      additionalComments: JSON.stringify({
        coolThingsLearned: getToString("coolThingsLearned") || "",
        toolsUsed: getToString("toolsUsed") || "",
        happyAccidents: getToString("happyAccidents") || "",
        didntWork: getToString("didntWork") || "",
      }),
    });
    
    return handleResponse(201, Navigation.Submit, "");
  } catch (error) {
    return handleResponse(500, Navigation.Submit, (error as Error).message);
  }
}
