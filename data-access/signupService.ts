"use server";

import { db } from "@/db";
import { signUps, songs, users, unverifiedSignups } from "@/db/schema";
import { Navigation } from "@/enum/navigation";
import { FormReturn } from "@/types";
import { handleResponse } from "@/utils";
import { getAuthUser } from "@/utils/supabase/server";
import { createClient } from "@/utils/supabase/server";
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



// Import shared schemas
import { signupSchema, nonLoggedInSchema } from "@/schemas/signupSchemas";

// Alias for backward compatibility
const nonAuthSignupSchema = nonLoggedInSchema;

export async function signupWithOTP(formData: FormData): Promise<FormReturn> {
  "use server";
  
  try {
    // Extract and validate form data
    const formDataObj = {
      songTitle: formData.get("songTitle")?.toString() || "",
      artist: formData.get("artist")?.toString() || "",
      youtubeLink: formData.get("youtubeLink")?.toString() || "",
      additionalComments: formData.get("additionalComments")?.toString() || "",
      roundId: Number(formData.get("roundId")?.toString() || "-1"),
      email: formData.get("email")?.toString() || "",
      name: formData.get("name")?.toString() || "",
      location: formData.get("location")?.toString() || "",
    };
    
    // Validate with Zod
    const validationResult = nonAuthSignupSchema.safeParse(formDataObj);
    
    if (!validationResult.success) {
      // Format Zod errors into a readable message
      const errorMessages = validationResult.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      return handleResponse(400, Navigation.SignUp, errorMessages);
    }
    
    const validData = validationResult.data;
    
    // Get the next unverified signup ID
    const lastUnverifiedSignupId = await db
      .select({ id: unverifiedSignups.id })
      .from(unverifiedSignups)
      .orderBy(sql`id desc`)
      .limit(1);
    
    const nextUnverifiedSignupId = (lastUnverifiedSignupId[0]?.id || 0) + 1;
    
    // Check if there's already an unverified signup with this email
    await db.delete(unverifiedSignups)
      .where(eq(unverifiedSignups.email, validData.email.trim()));
    
    // Create an unverified signup record
    // Using a type assertion to work around schema mismatch
    await db.insert(unverifiedSignups).values({
      id: nextUnverifiedSignupId,
      email: validData.email.trim(),
      songTitle: validData.songTitle,
      artist: validData.artist,
      youtubeLink: validData.youtubeLink,
      additionalComments: validData.additionalComments || "",
      roundId: validData.roundId
    } as any);
    
    // Create a client to send the OTP
    const supabaseClient = await createClient();
    
    // Send the magic link with user metadata
    const { error } = await supabaseClient.auth.signInWithOtp({
      email: validData.email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
        data: {
          name: validData.name,
          location: validData.location || "",
        },
      },
    });
    
    if (error) {
      // Clean up the unverified signup if OTP fails
      await db.delete(unverifiedSignups).where(eq(unverifiedSignups.email, validData.email.trim()));
      return handleResponse(400, Navigation.SignUp, error.message);
    }
    
    return handleResponse(200, Navigation.SignUp, "Please check your email for a verification link to complete your signup.");
  } catch (error) {
    return handleResponse(500, Navigation.SignUp, (error as Error).message);
  }
}

// Verify signup with user email
export async function verifySignupByEmail(): Promise<FormReturn> {
  "use server";
  
  const { userId, email } = getAuthUser();
  
  if (!userId || !email) {
    return handleResponse(401, Navigation.SignUp, "You must be authenticated to complete signup");
  }
  
  try {
    // Find the unverified signup record by email
    const unverifiedSignup = await db
      .select()
      .from(unverifiedSignups)
      .where(eq(unverifiedSignups.email, email))
      .limit(1);
    
    if (!unverifiedSignup.length) {
      return handleResponse(404, Navigation.SignUp, "No pending signup found for your email");
    }
    
    // Check if user exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.userid, userId))
      .limit(1);
    
    // If user doesn't exist, create them
    if (existingUser.length === 0) {
      console.log("Creating new user in database:", { userId, email });
      // Generate a username based on email
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      // Insert the user
      await db.insert(users).values({
        userid: userId,
        email: email,
        username: username,
      });
    }
    
    const signupData = unverifiedSignup[0];
    
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
        title: signupData.songTitle,
        artist: signupData.artist,
      })
      .onConflictDoNothing()
      .returning();
    
    // Get the song ID (either from insert or existing)
    const songId = songResult[0]?.id || 
      (await db
        .select({ id: songs.id })
        .from(songs)
        .where(and(
          eq(songs.title, signupData.songTitle),
          eq(songs.artist, signupData.artist)
        ))
      )[0].id;

    // Get the next signup ID
    const lastSignupId = await db
      .select({ id: signUps.id })
      .from(signUps)
      .orderBy(sql`id desc`)
      .limit(1);
    
    const nextSignupId = (lastSignupId[0]?.id || 0) + 1;

    // Insert the verified signup
    await db.insert(signUps).values({
      id: nextSignupId,
      youtubeLink: signupData.youtubeLink,
      additionalComments: signupData.additionalComments,
      roundId: signupData.roundId,
      songId: songId,
      userId: userId,
    });
    
    // Delete the unverified signup record
    await db.delete(unverifiedSignups)
      .where(eq(unverifiedSignups.email, email));

    return handleResponse(200, Navigation.Dashboard, "Your signup has been verified successfully!");
  } catch (error) {
    return handleResponse(500, Navigation.SignUp, (error as Error).message);
  }
}

// Legacy function - kept for backward compatibility
export async function completeSignupAfterVerification(params: {
  roundId: number;
  songTitle: string;
  artist: string;
  youtubeLink: string;
  additionalComments?: string;
}): Promise<FormReturn> {
  "use server";
  
  const { userId } = getAuthUser();
  
  if (!userId) {
    return handleResponse(401, Navigation.SignUp, "You must be authenticated to complete signup");
  }
  
  try {
    // Create a FormData object with the signup information
    const formData = new FormData();
    formData.append("songTitle", params.songTitle);
    formData.append("artist", params.artist);
    formData.append("youtubeLink", params.youtubeLink);
    if (params.additionalComments) {
      formData.append("additionalComments", params.additionalComments);
    }
    formData.append("roundId", params.roundId.toString());
    
    // Call the centralized signup function with the user ID
    // This will mark the signup as verified since we're providing a userId
    return await signup(formData, userId);
  } catch (error) {
    return handleResponse(500, Navigation.SignUp, (error as Error).message);
  }
}

export async function adminSignupUser(formData: FormData): Promise<FormReturn> {
  "use server";
  
  try {
    // Extract and validate form data
    const userId = formData.get("userId")?.toString() || "";
    const roundId = Number(formData.get("roundId")?.toString() || "-1");
    const songTitle = formData.get("songTitle")?.toString() || "";
    const artist = formData.get("artist")?.toString() || "";
    const youtubeLink = formData.get("youtubeLink")?.toString() || "";
    const additionalComments = formData.get("additionalComments")?.toString() || "";
    
    if (!userId) {
      return { status: "Error", message: "User ID is required" };
    }
    
    if (roundId < 0) {
      return { status: "Error", message: "Valid Round ID is required" };
    }
    
    if (!songTitle || !artist || !youtubeLink) {
      return { status: "Error", message: "Song title, artist, and YouTube link are required" };
    }
    
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
        title: songTitle,
        artist: artist,
      })
      .onConflictDoNothing()
      .returning();
    
    // Get the song ID (either from insert or existing)
    const songId = songResult[0]?.id || 
      (await db
        .select({ id: songs.id })
        .from(songs)
        .where(and(
          eq(songs.title, songTitle),
          eq(songs.artist, artist)
        ))
      )[0].id;

    // Check if user is already signed up for this round
    const existingSignup = await db
      .select()
      .from(signUps)
      .where(and(
        eq(signUps.userId, userId),
        eq(signUps.roundId, roundId)
      ));
      
    if (existingSignup.length > 0) {
      return { status: "Error", message: "User is already signed up for this round" };
    }

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
      youtubeLink: youtubeLink,
      additionalComments: additionalComments,
      roundId: roundId,
      songId: songId,
      userId: userId,
    });

    return { status: "Success", message: "User has been successfully signed up for the round!" };
  } catch (error) {
    return { status: "Error", message: (error as Error).message };
  }
}

export async function signup(formData: FormData, providedUserId?: string): Promise<FormReturn> {
  "use server";
  // Use provided userId if available, otherwise get from auth
  const { userId: authUserId } = getAuthUser();
  const userId = providedUserId || authUserId;
  
  if (!userId) {
    return handleResponse(401, Navigation.SignUp, "User ID is required for signup");
  }
  
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
    
    // Check if user has already signed up for this round
    const existingSignup = await db
      .select({ id: signUps.id })
      .from(signUps)
      .where(
        and(
          eq(signUps.userId, userId),
          eq(signUps.roundId, validData.roundId)
        )
      )
      .limit(1);
    
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

    // If user has already signed up, update their signup
    if (existingSignup.length > 0) {
      await db.update(signUps)
        .set({
          youtubeLink: validData.youtubeLink,
          additionalComments: validData.additionalComments,
          songId: songId,
        })
        .where(
          eq(signUps.id, existingSignup[0].id)
        );
      
      // Redirect back to the dashboard with success message
      return handleResponse(200, Navigation.Dashboard, "Your song has been updated successfully!");
    } else {
      // Get the next signup ID for a new signup
      const lastSignupId = await db
        .select({ id: signUps.id })
        .from(signUps)
        .orderBy(sql`id desc`)
        .limit(1);
      
      const nextSignupId = (lastSignupId[0]?.id || 0) + 1;

      // Then insert the new signup
      await db.insert(signUps).values({
        id: nextSignupId,
        youtubeLink: validData.youtubeLink,
        additionalComments: validData.additionalComments,
        roundId: validData.roundId,
        songId: songId,
        userId: userId,
      });

      return handleResponse(200, Navigation.Dashboard, "Your signup has been verified successfully!");
    }
  } catch (error) {
    return handleResponse(500, Navigation.SignUp, (error as Error).message);
  }
}