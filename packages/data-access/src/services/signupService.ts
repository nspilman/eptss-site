"use server";

import { db } from "../db";
import { signUps, songs, users, unverifiedSignups, roundMetadata } from "../db/schema";
import { Navigation } from "@eptss/shared";
import { FormReturn } from "../types";
import { handleResponse } from "../utils";
import { getAuthUser } from "../utils/supabase/server";
import { createClient } from "../utils/supabase/server";
import { eq, sql, and, ne } from "drizzle-orm";

/**
 * Get the most recent signup data for a user
 * Used in email verification flow
 */
export async function getMostRecentSignupForUser(userId: string) {
  const result = await db
    .select({
      roundId: signUps.roundId,
      songTitle: songs.title,
      artist: songs.artist,
      youtubeLink: signUps.youtubeLink,
    })
    .from(signUps)
    .leftJoin(songs, eq(signUps.songId, songs.id))
    .where(eq(signUps.userId, userId))
    .orderBy(sql`${signUps.createdAt} desc`)
    .limit(1);

  return result[0] || null;
}

export const getSignupsByRound = async (roundId: number) => {
  const data = await db
    .select({
      songId: signUps.songId,
      youtubeLink: signUps.youtubeLink,
      additionalComments: signUps.additionalComments,
      song: {
        title: songs.title,
        artist: songs.artist
      },
      email: users.email,
      userId: users.userid,
      username: users.username,
      publicDisplayName: users.publicDisplayName,
      profilePictureUrl: users.profilePictureUrl
    })
    .from(signUps)
    .leftJoin(songs, eq(signUps.songId, songs.id))
    .leftJoin(users, eq(signUps.userId, users.userid))
    .where(
      eq(signUps.roundId, roundId)
    )
    .orderBy(signUps.createdAt);

    const unsortedUrls = data?.map(field => field.youtubeLink) || [];
    const sortedData = seededShuffle(data || [], JSON.stringify(unsortedUrls));

    // Process the data and throw errors for invalid entries
    return sortedData.map(val => {
      if (!val.userId) {
        throw new Error(`Signup for round ${roundId} has missing userId`);
      }
      if (!val.email) {
        throw new Error(`Signup for round ${roundId} has missing email`);
      }

      return {
        songId: val.songId,
        youtubeLink: val.youtubeLink,
        userId: val.userId,
        email: val.email,
        username: val.username || undefined,
        publicDisplayName: val.publicDisplayName || undefined,
        profilePictureUrl: val.profilePictureUrl || undefined,
        additionalComments: val.additionalComments || undefined,
        song: {
          title: val.song?.title || "",
          artist: val.song?.artist || ""
        }
      };
    });
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

export const getUserSignupData = async (userId: string, roundId: number) => {
  const existingSignup = await db
    .select({
      songId: signUps.songId,
      youtubeLink: signUps.youtubeLink,
      additionalComments: signUps.additionalComments,
    })
    .from(signUps)
    .where(
      and(
        eq(signUps.userId, userId),
        eq(signUps.roundId, roundId)
      )
    )
    .limit(1);

  if (existingSignup.length === 0) {
    return undefined;
  }

  // If no song was required for signup, return without song details
  if (existingSignup[0].songId === null) {
    return {
      songTitle: undefined,
      artist: undefined,
      youtubeLink: existingSignup[0].youtubeLink || undefined,
      additionalComments: existingSignup[0].additionalComments || undefined,
    };
  }

  // Get the song details
  const songDetails = await db
    .select({
      title: songs.title,
      artist: songs.artist,
    })
    .from(songs)
    .where(eq(songs.id, existingSignup[0].songId))
    .limit(1);

  if (songDetails.length === 0) {
    return undefined;
  }

  return {
    songTitle: songDetails[0].title || undefined,
    artist: songDetails[0].artist || undefined,
    youtubeLink: existingSignup[0].youtubeLink || undefined,
    additionalComments: existingSignup[0].additionalComments || undefined,
  };
};



// Import shared schemas
import { signupSchema, signupSchemaNoSong, nonLoggedInSchema, nonLoggedInSchemaNoSong } from "../schemas/signupSchemas";
import { seededShuffle } from "../utils/seededShuffle";
import { validateFormData } from "../utils/formDataHelpers";
import { getProjectBusinessRules, getProjectEmailConfig } from "@eptss/project-config";
import { getProjectSlugFromId, type ProjectSlug } from "../utils/projectUtils";
import { validateReferralCode } from "./referralService";
import { getNextId } from "../utils/dbHelpers";
import { getRoundById } from "./roundService";
import { sendRoundSignupConfirmation } from "@eptss/email/services/emailService";

export async function signupWithOTP(formData: FormData): Promise<FormReturn> {
  "use server";

  try {
    // Get roundId early to determine project and business rules
    const roundId = Number(formData.get("roundId"));
    console.log('[signupWithOTP] Starting validation. RoundId:', roundId);

    if (!roundId || isNaN(roundId)) {
      return handleResponse(400, Navigation.Dashboard, "Invalid round ID");
    }

    // Get the project ID from the round to check business rules
    const roundResult = await db
      .select({ projectId: roundMetadata.projectId })
      .from(roundMetadata)
      .where(eq(roundMetadata.id, roundId))
      .limit(1);

    console.log('[signupWithOTP] Round lookup result:', roundResult);

    if (!roundResult.length) {
      return handleResponse(404, Navigation.Dashboard, "Round not found");
    }

    const projectId = roundResult[0].projectId;
    const projectSlug = getProjectSlugFromId(projectId);

    console.log('[signupWithOTP] ProjectId:', projectId, 'ProjectSlug:', projectSlug);

    if (!projectSlug) {
      return handleResponse(404, Navigation.Dashboard, "Project not found");
    }

    // Get business rules to determine if song is required
    const businessRules = await getProjectBusinessRules(projectSlug);
    const schema = businessRules.requireSongOnSignup ? nonLoggedInSchema : nonLoggedInSchemaNoSong;

    console.log('[signupWithOTP] Business rules:', businessRules);
    console.log('[signupWithOTP] requireSongOnSignup:', businessRules.requireSongOnSignup);
    console.log('[signupWithOTP] Using schema:', businessRules.requireSongOnSignup ? 'nonLoggedInSchema (WITH song)' : 'nonLoggedInSchemaNoSong (NO song)');

    // Validate form data with the appropriate schema
    const validation = validateFormData(formData, schema);

    if (!validation.success) {
      console.warn('⚠️ [WARN] OTP signup validation failed', { error: validation.error });
      return handleResponse(400, Navigation.Dashboard, validation.error);
    }

    const validData = validation.data;

    // Validate referral code (REQUIRED for all new signups)
    const referralCode = formData.get('referralCode')?.toString();

    if (!referralCode) {
      return handleResponse(
        400,
        Navigation.Dashboard,
        "A referral code is required to create an account. Please ask an existing member for a referral link."
      );
    }

    const referralValidation = await validateReferralCode(referralCode);

    if (!referralValidation.valid) {
      return handleResponse(
        400,
        Navigation.Dashboard,
        referralValidation.message
      );
    }
    
    // Get the next unverified signup ID
    const nextUnverifiedSignupId = await getNextId(unverifiedSignups, unverifiedSignups.id);
    
    // Check if there's already an unverified signup with this email
    await db.delete(unverifiedSignups)
      .where(eq(unverifiedSignups.email, validData.email.trim()));
    
    // Create an unverified signup record
    // Using a type assertion to work around schema mismatch
    await db.insert(unverifiedSignups).values({
      id: nextUnverifiedSignupId,
      email: validData.email.trim(),
      songTitle: validData.songTitle || null,
      artist: validData.artist || null,
      youtubeLink: validData.youtubeLink || null,
      additionalComments: validData.additionalComments || "",
      roundId: validData.roundId,
      referralCode: referralCode
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
      return handleResponse(400, Navigation.Dashboard, error.message);
    }
    
    return handleResponse(200, Navigation.Dashboard, "Please check your email for a verification link to complete your signup.");
  } catch (error) {
    return handleResponse(500, Navigation.Dashboard, (error as Error).message);
  }
}

// Verify signup with user email
export async function signupUserWithoutSong(props: { projectId: string, roundId: number, userId: string, additionalComments?: string }): Promise<FormReturn> {
  "use server";

  const { projectId, roundId, userId, additionalComments = "" } = props;
  
  if (!userId) {
    return handleResponse(401, Navigation.Dashboard, "User ID is required for signup");
  }
  
  try {
    // Check if user has already signed up for this round
    const existingSignup = await db
      .select({ id: signUps.id })
      .from(signUps)
      .where(
        and(
          eq(signUps.userId, userId),
          eq(signUps.roundId, roundId)
        )
      )
      .limit(1);
    
    if (existingSignup.length > 0) {
      // User already signed up, update to songId -1
      await db.update(signUps)
        .set({
          youtubeLink: "",
          additionalComments: additionalComments,
          songId: -1,
        })
        .where(
          eq(signUps.id, existingSignup[0].id)
        );
      
      return handleResponse(200, Navigation.Dashboard, "You have successfully signed up for this round!");
    } else {
      // Get the next signup ID for a new signup
      const nextSignupId = await getNextId(signUps, signUps.id);

      // Insert new signup with songId -1
      await db.insert(signUps).values({
        id: nextSignupId,
        projectId: projectId,
        youtubeLink: "",
        additionalComments: additionalComments,
        roundId: roundId,
        songId: -1,
        userId: userId,
      });

      return handleResponse(200, Navigation.Dashboard, "You have successfully signed up for this round!");
    }
  } catch (error) {
    return handleResponse(500, Navigation.Dashboard, (error as Error).message);
  }
}

export async function verifySignupByEmail(): Promise<FormReturn> {
  "use server";

  const { userId, email } = await getAuthUser();

  if (!userId || !email) {
    return handleResponse(401, Navigation.Dashboard, "You must be authenticated to complete signup");
  }

  try {
    // Import referral service for recording referrals
    const { recordReferral } = await import("./referralService");

    // Get the full user object from Supabase to access metadata
    const supabase = await createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();

    // Extract display name from user metadata (set during signup)
    const publicDisplayName = supabaseUser?.user_metadata?.name || undefined;

    // Find the unverified signup record by email
    const unverifiedSignup = await db
      .select()
      .from(unverifiedSignups)
      .where(eq(unverifiedSignups.email, email))
      .limit(1);

    if (!unverifiedSignup.length) {
      return handleResponse(404, Navigation.Dashboard, "No pending signup found for your email");
    }

    // Check if user exists in our database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.userid, userId))
      .limit(1);

    let userName: string | undefined;

    // If user doesn't exist, create them
    if (existingUser.length === 0) {
      console.log("Creating new user in database:", { userId, email });
      // Generate a username based on email
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

      // Insert the user with display name from metadata
      await db.insert(users).values({
        userid: userId,
        email: email,
        username: username,
        publicDisplayName: publicDisplayName,
      });

      userName = username;
    } else {
      // User already exists - optionally backfill publicDisplayName from metadata
      const currentUser = existingUser[0];
      userName = currentUser.username;

      if (!currentUser.publicDisplayName && publicDisplayName) {
        console.log('[verifySignupByEmail] Backfilling publicDisplayName from Supabase metadata for user:', userId);
        await db
          .update(users)
          .set({ publicDisplayName })
          .where(eq(users.userid, userId));
      }
    }
    
    const signupData = unverifiedSignup[0];

    // Get the project ID from the round
    const roundResult = await db
      .select({ projectId: roundMetadata.projectId })
      .from(roundMetadata)
      .where(eq(roundMetadata.id, signupData.roundId))
      .limit(1);

    if (!roundResult.length) {
      return handleResponse(404, Navigation.Dashboard, "Round not found");
    }

    const projectId = roundResult[0].projectId;

    // Only insert song if song data is provided
    let songId: number | null = null;

    if (signupData.songTitle && signupData.artist) {
      // Get the next song ID
      const nextSongId = await getNextId(songs, songs.id);

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
      songId = songResult[0]?.id ||
        (await db
          .select({ id: songs.id })
          .from(songs)
          .where(and(
            eq(songs.title, signupData.songTitle),
            eq(songs.artist, signupData.artist)
          ))
        )[0].id;
    }

    // Get the next signup ID
    const nextSignupId = await getNextId(signUps, signUps.id);

    // Insert the verified signup
    await db.insert(signUps).values({
      id: nextSignupId,
      projectId: projectId,
      youtubeLink: signupData.youtubeLink,
      additionalComments: signupData.additionalComments,
      roundId: signupData.roundId,
      songId: songId,
      userId: userId,
    });

    // Send signup confirmation email (don't fail signup if email fails)
    try {
      if (signupData.songTitle && signupData.artist && signupData.youtubeLink) {
        // Get project slug
        const projectSlug = getProjectSlugFromId(projectId);

        if (projectSlug) {
          // Get round details with phase dates
          const roundResult = await getRoundById(signupData.roundId);

          if (roundResult.status === 'success') {
            const round = roundResult.data;

            // Get project email config
            const emailConfig = await getProjectEmailConfig(projectSlug);

            // Send confirmation email
            await sendRoundSignupConfirmation({
              to: email,
              userName: userName || undefined,
              roundName: round.slug || `Round ${signupData.roundId}`,
              songTitle: signupData.songTitle,
              artist: signupData.artist,
              youtubeLink: signupData.youtubeLink,
              roundSlug: round.slug,
              phaseDates: {
                votingOpens: round.votingOpens.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                coveringBegins: round.coveringBegins.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                coversDue: round.coversDue.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                listeningParty: round.listeningParty.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              },
              emailConfig: emailConfig.templates.signupConfirmation,
            });
          }
        }
      }
    } catch (emailError) {
      console.error('[verifySignupByEmail] Failed to send confirmation email:', emailError);
      // Don't fail the signup if email fails
    }

    // Record the referral if a referral code was provided
    if (signupData.referralCode) {
      const referralResult = await recordReferral(userId, signupData.referralCode);
      if (!referralResult.success) {
        console.error("Failed to record referral:", referralResult.message);
        // We don't fail the signup if referral recording fails, just log it
      }
    }

    // Delete the unverified signup record
    await db.delete(unverifiedSignups)
      .where(eq(unverifiedSignups.email, email));

    return handleResponse(200, Navigation.Dashboard, "Your signup has been verified successfully!");
  } catch (error) {
    return handleResponse(500, Navigation.Dashboard, (error as Error).message);
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
  
  const { userId } = await getAuthUser();
  
  if (!userId) {
    return handleResponse(401, Navigation.Dashboard, "You must be authenticated to complete signup");
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
    return handleResponse(500, Navigation.Dashboard, (error as Error).message);
  }
}

export async function adminSignupUser(formData: FormData): Promise<FormReturn> {
  "use server";
  
  console.log("=== adminSignupUser START ===");
  
  try {
    // Extract and validate form data
    const userId = formData.get("userId")?.toString() || "";
    const roundId = Number(formData.get("roundId")?.toString() || "-1");
    const providedSongId = formData.get("songId")?.toString();
    const songTitle = formData.get("songTitle")?.toString() || "";
    const artist = formData.get("artist")?.toString() || "";
    const youtubeLink = formData.get("youtubeLink")?.toString() || "";
    const additionalComments = formData.get("additionalComments")?.toString() || "";
    
    console.log("adminSignupUser called with:", { userId, roundId, providedSongId, songTitle, artist });
    
    if (!userId) {
      return { status: "Error", message: "User ID is required" };
    }
    
    if (roundId < 0) {
      return { status: "Error", message: "Valid Round ID is required" };
    }
    
    let songId: number;
    
    // Check if signing up without a song
    if (providedSongId === "-1") {
      console.log("Signing up without a song");
      songId = -1;
      console.log("Set songId to -1");
    } else {
      console.log("Creating new song");
      // Validate song fields are provided
      if (!songTitle || !artist || !youtubeLink) {
        return { status: "Error", message: "Song title, artist, and YouTube link are required" };
      }

      // Get the next song ID
      const nextSongId = await getNextId(songs, songs.id);

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
      songId = songResult[0]?.id || 
        (await db
          .select({ id: songs.id })
          .from(songs)
          .where(and(
            eq(songs.title, songTitle),
            eq(songs.artist, artist)
          ))
        )[0].id;
    }

    // Check if user is already signed up for this round
    console.log("Checking for existing signup");
    const existingSignup = await db
      .select()
      .from(signUps)
      .where(and(
        eq(signUps.userId, userId),
        eq(signUps.roundId, roundId)
      ));
    console.log("Existing signup check complete:", existingSignup.length);
      
    if (existingSignup.length > 0) {
      return { status: "Error", message: "User is already signed up for this round" };
    }

    // Insert the signup using raw SQL to avoid ID generation issues
    console.log("Inserting signup with songId:", songId);
    
    try {
      const result = await db.execute(sql`
        INSERT INTO sign_ups (id, youtube_link, additional_comments, round_id, song_id, user_id, created_at)
        VALUES (
          (SELECT COALESCE(MAX(id), 0) + 1 FROM sign_ups),
          ${youtubeLink || ""},
          ${additionalComments || ""},
          ${roundId},
          ${songId},
          ${userId},
          NOW()
        )
        RETURNING id
      `);
      console.log("Signup inserted successfully, result:", result);
    } catch (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    const successMessage = songId === -1 
      ? "User has been successfully signed up for the round without a song!" 
      : "User has been successfully signed up for the round!";
    
    console.log("=== adminSignupUser SUCCESS ===");
    return { status: "Success", message: successMessage };
  } catch (error) {
    console.error("=== adminSignupUser ERROR ===", error);
    return { status: "Error", message: (error as Error).message };
  }
}


export async function signup(formData: FormData, providedUserId?: string): Promise<FormReturn> {
  "use server";
  // Use provided userId if available, otherwise get from auth
  const { userId: authUserId, email: authEmail } = await getAuthUser();
  const userId = providedUserId || authUserId;
  
  if (!userId) {
    return handleResponse(401, Navigation.Dashboard, "User ID is required for signup");
  }
  
  try {
    // Get the round ID early to fetch project config
    const roundId = Number(formData.get("roundId"));
    console.log('[signup] Starting signup for roundId:', roundId, 'userId:', userId);

    if (!roundId || isNaN(roundId)) {
      console.error('[signup] Invalid round ID:', formData.get("roundId"));
      return handleResponse(400, Navigation.Dashboard, "Invalid round ID");
    }

    // Get the project ID from the round
    const roundResult = await db
      .select({ projectId: roundMetadata.projectId })
      .from(roundMetadata)
      .where(eq(roundMetadata.id, roundId))
      .limit(1);

    if (!roundResult.length) {
      console.error('[signup] Round not found:', roundId);
      return handleResponse(404, Navigation.Dashboard, "Round not found");
    }

    const projectId = roundResult[0].projectId;
    console.log('[signup] Found projectId:', projectId);

    // Get project slug and business rules to determine schema
    const projectSlug = getProjectSlugFromId(projectId);
    if (!projectSlug) {
      console.error('[signup] Project slug not found for projectId:', projectId);
      return handleResponse(404, Navigation.Dashboard, "Project not found");
    }

    const businessRules = await getProjectBusinessRules(projectSlug);
    const schema = businessRules.requireSongOnSignup ? signupSchema : signupSchemaNoSong;

    console.log('[signup] projectSlug:', projectSlug, 'requireSongOnSignup:', businessRules.requireSongOnSignup);

    // Validate form data with the appropriate Zod schema
    const validation = validateFormData(formData, schema);

    if (!validation.success) {
      console.error('[signup] Validation failed:', validation.error);
      return handleResponse(400, Navigation.Dashboard, validation.error);
    }

    const validData = validation.data;
    console.log('[signup] Validation succeeded, validData:', validData);

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

    // Handle song data only if song is required on signup
    let songId: number | null = null;
    if (businessRules.requireSongOnSignup && validData.songTitle && validData.artist) {
      // Get the next song ID
      const nextSongId = await getNextId(songs, songs.id);

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
      songId = songResult[0]?.id ||
        (await db
          .select({ id: songs.id })
          .from(songs)
          .where(and(
            eq(songs.title, validData.songTitle),
            eq(songs.artist, validData.artist)
          ))
        )[0].id;
    }

    // If user has already signed up, update their signup
    if (existingSignup.length > 0) {
      await db.update(signUps)
        .set({
          youtubeLink: validData.youtubeLink || null,
          additionalComments: validData.additionalComments || null,
          songId: songId,
        })
        .where(
          eq(signUps.id, existingSignup[0].id)
        );

      // Redirect back to the dashboard with success message
      const message = businessRules.requireSongOnSignup
        ? "Your song has been updated successfully!"
        : "Your signup has been updated successfully!";
      return handleResponse(200, Navigation.Dashboard, message);
    } else {
      // Get the next signup ID for a new signup
      const nextSignupId = await getNextId(signUps, signUps.id);

      // Then insert the new signup
      await db.insert(signUps).values({
        id: nextSignupId,
        projectId: projectId,
        youtubeLink: validData.youtubeLink || null,
        additionalComments: validData.additionalComments || null,
        roundId: validData.roundId,
        songId: songId,
        userId: userId,
      });

      // Send signup confirmation email (don't fail signup if email fails)
      try {
        // Get user details
        const userResult = await db
          .select({ email: users.email, username: users.username })
          .from(users)
          .where(eq(users.userid, userId))
          .limit(1);

        if (userResult.length && validData.songTitle && validData.artist && validData.youtubeLink) {
          const userEmail = userResult[0].email;
          const userName = userResult[0].username;

          // Get round details with phase dates
          const roundResult = await getRoundById(validData.roundId);

          if (roundResult.status === 'success') {
            const round = roundResult.data;

            // Get project email config
            const emailConfig = await getProjectEmailConfig(projectSlug);

            // Send confirmation email
            await sendRoundSignupConfirmation({
              to: userEmail,
              userName: userName || undefined,
              roundName: round.slug || `Round ${validData.roundId}`,
              songTitle: validData.songTitle,
              artist: validData.artist,
              youtubeLink: validData.youtubeLink,
              roundSlug: round.slug,
              phaseDates: {
                votingOpens: round.votingOpens.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                coveringBegins: round.coveringBegins.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                coversDue: round.coversDue.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                listeningParty: round.listeningParty.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              },
              emailConfig: emailConfig.templates.signupConfirmation,
            });
          }
        }
      } catch (emailError) {
        console.error('[signup] Failed to send confirmation email:', emailError);
        // Don't fail the signup if email fails
      }

      return handleResponse(200, Navigation.Dashboard, "Your signup has been verified successfully!");
    }
  } catch (error) {
    console.error('[signup] Unexpected error during signup:', error);
    console.error('[signup] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return handleResponse(500, Navigation.Dashboard, `Signup failed: ${errorMessage}`);
  }
}