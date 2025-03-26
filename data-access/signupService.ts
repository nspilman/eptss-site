"use server";

import { db } from "@/db";
import { signUps, songs, users } from "@/db/schema";
import { Navigation } from "@/enum/navigation";
import { FormReturn } from "@/types";
import { getDataToString, handleResponse } from "@/utils";
import { getAuthUser } from "@/utils/supabase/server";
import { eq, sql, and } from "drizzle-orm";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

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



// Create a schema for the form fields directly
const signupSchema = z.object({
  songTitle: z.string().min(1, "Song title is required"),
  artist: z.string().min(1, "Artist is required"),
  youtubeLink: z.string().min(1, "Youtube link is required")
    .regex(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/, "Must be a valid YouTube URL"),
  additionalComments: z.string().optional(),
  roundId: z.number(),
});

export async function signup(formData: FormData): Promise<FormReturn> {
  "use server";
  const { userId } = getAuthUser();
  
  try {
    // Extract and validate form data
    const formDataObj = {
      songTitle: formData.get("songTitle")?.toString() || "",
      artist: formData.get("artist")?.toString() || "",
      youtubeLink: formData.get("youtubeLink")?.toString() || "",
      additionalComments: formData.get("additionalComments")?.toString() || "",
      roundId: Number(formData.get("roundId")?.toString() || "-1"),
    };
    
    // Validate with Zod
    const validationResult = signupSchema.safeParse(formDataObj);
    
    if (!validationResult.success) {
      // Format Zod errors into a readable message
      const errorMessages = validationResult.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      return handleResponse(400, Navigation.SignUp, errorMessages);
    }
    
    const validData = validationResult.data;
    
    // Get the next song ID
    const lastSongId = await db
      .select({ id: songs.id })
      .from(songs)
      .orderBy(sql`id desc`)
      .limit(1);
    
    const nextSongId = (lastSongId[0]?.id || 0) + 1;

    // First insert or get the song
    const songResult = await db
      .insert(songs)
      .values({
        id: nextSongId,
        title: validData.songTitle,
        artist: validData.artist,
      })
      .onConflictDoNothing()
      .returning();
    
    // Get the song ID (either from insert or existing)
    const songId = songResult[0]?.id || 
      (await db
        .select({ id: songs.id })
        .from(songs)
        .where(and(
          eq(songs.title, validData.songTitle),
          eq(songs.artist, validData.artist)
        ))
      )[0].id;

    // Get the next signup ID
    const lastSignupId = await db
      .select({ id: signUps.id })
      .from(signUps)
      .orderBy(sql`id desc`)
      .limit(1);
    
    const nextSignupId = (lastSignupId[0]?.id || 0) + 1;

    // Then insert the signup
    await db.insert(signUps).values({
      id: nextSignupId,
      youtubeLink: validData.youtubeLink,
      additionalComments: validData.additionalComments,
      roundId: validData.roundId,
      songId: songId,
      userId: userId || "",
    });

    return handleResponse(201, Navigation.SignUp, "");
  } catch (error) {
    return handleResponse(500, Navigation.SignUp, (error as Error).message);
  }
}