"use server";

import { db } from "@/db";
import { signUps, songs, users } from "@/db/schema";
import { Navigation } from "@/enum/navigation";
import { FormReturn } from "@/types";
import { getDataToString, handleResponse } from "@/utils";
import { getAuthUser } from "@/utils/supabase/server";
import { eq, sql, and } from "drizzle-orm";

export const getSignupsByRound = async (roundId: number) => {
  const data = await db
    .select({
      songId: signUps.songId,
      youtubeLink: signUps.youtubeLink,
      song: {
        title: songs.title,
        artist: songs.artist
      },
      email: users.email,
      userId: users.userid
    })
    .from(signUps)
    .leftJoin(songs, eq(signUps.songId, songs.id))
    .leftJoin(users, eq(signUps.userId, users.userid))
    .where(eq(signUps.roundId, roundId))
    .orderBy(signUps.createdAt);
    
    return data.map((val) => ({
      ...val,
      song: {
        title: val.song?.title || "",
        artist: val.song?.artist || ""
      }

    }));
};



export const getSignupUsersByRound = async (roundId: number) => {
  return await db
    .select({
      userId: signUps.userId,
      user: {
        email: users.email,
        userid: users.userid
      }
    })
    .from(signUps)
    .leftJoin(users, eq(signUps.userId, users.userid))
    .where(eq(signUps.roundId, roundId));
};



export async function signup(formData: FormData): Promise<FormReturn> {
  "use server";
  const getToString = (key: string) => getDataToString(formData, key);
  const { userId } = getAuthUser();
  
  try {
    // First insert or get the song
    const songResult = await db
      .insert(songs)
      .values({
        id: sql`nextval('songs_id_seq')`,
        title: getToString("songTitle") || "",
        artist: getToString("artist") || "",
      })
      .onConflictDoNothing()
      .returning();
    
    // Get the song ID (either from insert or existing)
    const songId = songResult[0]?.id || 
      (await db
        .select({ id: songs.id })
        .from(songs)
        .where(and(
          eq(songs.title, getToString("songTitle") || ""),
          eq(songs.artist, getToString("artist") || "")
        ))
      )[0].id;

    // Then insert the signup
    await db.insert(signUps).values({
      id: sql`nextval('sign_ups_id_seq')`,
      youtubeLink: getToString("youtubeLink") || "",
      additionalComments: getToString("additionalComments") || "",
      roundId: JSON.parse(getToString("roundId") || "-1"),
      songId: songId,
      userId: userId || "",
    });

    return handleResponse(201, Navigation.SignUp, "");
  } catch (error) {
    return handleResponse(500, Navigation.SignUp, (error as Error).message);
  }
}