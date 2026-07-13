"use server";

import { db } from "../db";
import { loadActiveHandles } from "@eptss/db";
import { signUps, songs, users, unverifiedSignups, roundMetadata } from "../db/schema";
import { routes } from "@eptss/routing";
import { FormReturn } from "../types";
import { handleResponse } from "../utils";
import { getAuthUser } from "../utils/supabase/server";
import { createClient } from "../utils/supabase/server";
import { eq, sql, and, ne } from "drizzle-orm";
import { logger } from "@eptss/logger/server";

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

    // A linked Atmosphere handle replaces the EPTSS name wherever a participant
    // is shown (round participants, @mention suggestions). One batched lookup.
    const handles = await loadActiveHandles(
      (data || [])
        .map(d => d.userId)
        .filter((id): id is string => Boolean(id)),
    );

    // Process the data and throw errors for invalid entries
    // Note: No deduplication here - all signups are returned
    // Deduplication by songId happens in getVoteOptions for the voting ballot
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
        atprotoHandle: handles.get(val.userId) ?? null,
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

/**
 * Check if signup cap has been reached for a round
 * Returns { canSignup: boolean, currentCount: number, maxSignups: number | null, message?: string }
 */
export async function checkSignupCap(roundId: number): Promise<{
  canSignup: boolean;
  currentCount: number;
  maxSignups: number | null;
  message?: string;
}> {
  try {
    // Get the project ID from the round
    const roundResult = await db
      .select({ projectId: roundMetadata.projectId })
      .from(roundMetadata)
      .where(eq(roundMetadata.id, roundId))
      .limit(1);

    if (!roundResult.length) {
      return {
        canSignup: false,
        currentCount: 0,
        maxSignups: null,
        message: "Round not found",
      };
    }

    const projectId = roundResult[0].projectId;
    const projectSlug = getProjectSlugFromId(projectId);

    if (!projectSlug) {
      return {
        canSignup: false,
        currentCount: 0,
        maxSignups: null,
        message: "Project not found",
      };
    }

    // Get business rules to check if there's a signup cap
    const businessRules = await getProjectBusinessRules(projectSlug);
    const maxSignups = businessRules.maxSignupsPerRound;

    // If no cap is set, signups are unlimited
    if (!maxSignups) {
      return {
        canSignup: true,
        currentCount: 0,
        maxSignups: null,
      };
    }

    // Count current signups for this round
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(signUps)
      .where(eq(signUps.roundId, roundId));

    const currentCount = Number(countResult?.count || 0);

    if (currentCount >= maxSignups) {
      return {
        canSignup: false,
        currentCount,
        maxSignups,
        message: `This round has reached its maximum capacity of ${maxSignups} signups`,
      };
    }

    return {
      canSignup: true,
      currentCount,
      maxSignups,
    };
  } catch (error) {
    logger.error("Error checking signup cap", { component: "signupService", operation: "checkSignupCap", error });
    return {
      canSignup: false,
      currentCount: 0,
      maxSignups: null,
      message: "Failed to check signup capacity",
    };
  }
}



// Import shared schemas
import { signupSchema, signupSchemaNoSong, nonLoggedInSchema, nonLoggedInSchemaNoSong } from "../schemas/signupSchemas";
import { seededShuffle } from "../utils/seededShuffle";
import { validateFormData } from "../utils/formDataHelpers";
import { getProjectBusinessRules, getProjectEmailConfig } from "@eptss/project-config";
import { getProjectSlugFromId, type ProjectSlug } from "../utils/projectUtils";
import { getNextId } from "../utils/dbHelpers";
import { referralCodes, userReferrals } from "../db/schema";
import { getRoundById } from "./roundService";

/**
 * Validate a referral code - local implementation to avoid circular dependency
 */
async function validateReferralCodeForSignup(
  code: string
): Promise<{ valid: boolean; message: string; referralCodeId?: string }> {
  try {
    const [referralCode] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);

    if (!referralCode) {
      return { valid: false, message: 'Invalid referral code' };
    }

    if (!referralCode.isActive) {
      return { valid: false, message: 'This referral code is no longer active' };
    }

    if (referralCode.expiresAt && new Date(referralCode.expiresAt) < new Date()) {
      return { valid: false, message: 'This referral code has expired' };
    }

    if (referralCode.maxUses !== null && referralCode.usesCount >= referralCode.maxUses) {
      return { valid: false, message: 'This referral code has reached its maximum uses' };
    }

    return { valid: true, message: 'Referral code is valid', referralCodeId: referralCode.id };
  } catch (error) {
    logger.error("Error validating referral code", { component: "signupService", error });
    return { valid: false, message: 'Failed to validate referral code' };
  }
}

/**
 * Record a successful referral - local implementation to avoid circular dependency
 */
async function recordReferralForSignup(
  referredUserId: string,
  referralCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate the referral code
    const validation = await validateReferralCodeForSignup(referralCode);
    if (!validation.valid || !validation.referralCodeId) {
      return { success: false, message: validation.message };
    }

    // Get referral code details
    const [refCode] = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.id, validation.referralCodeId))
      .limit(1);

    if (!refCode) {
      return { success: false, message: 'Referral code not found' };
    }

    // Create referral record
    await db.insert(userReferrals).values({
      referredUserId,
      referrerUserId: refCode.createdByUserId,
      referralCodeId: validation.referralCodeId,
    });

    // Increment uses count
    await db
      .update(referralCodes)
      .set({
        usesCount: sql`${referralCodes.usesCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(referralCodes.id, validation.referralCodeId));

    return { success: true, message: 'Referral recorded successfully' };
  } catch (error) {
    logger.error("Error recording referral", { component: "signupService", error });
    return { success: false, message: 'Failed to record referral' };
  }
}
import { sendRoundSignupConfirmation } from "@eptss/email/services/emailService";

export async function signupWithOTP(formData: FormData): Promise<FormReturn> {
  "use server";

  try {
    // Get roundId early to determine project and business rules
    const roundId = Number(formData.get("roundId"));
    logger.info("Starting validation", { component: "signupService", operation: "signupWithOTP", roundId });

    if (!roundId || isNaN(roundId)) {
      return handleResponse(400, routes.dashboard.root(), "Invalid round ID");
    }

    // Get the project ID from the round to check business rules
    const roundResult = await db
      .select({ projectId: roundMetadata.projectId })
      .from(roundMetadata)
      .where(eq(roundMetadata.id, roundId))
      .limit(1);

    logger.info("Round lookup complete", { component: "signupService", operation: "signupWithOTP", roundResult });

    if (!roundResult.length) {
      return handleResponse(404, routes.dashboard.root(), "Round not found");
    }

    const projectId = roundResult[0].projectId;
    const projectSlug = getProjectSlugFromId(projectId);

    logger.info("Resolved project for round", { component: "signupService", operation: "signupWithOTP", projectId, projectSlug });

    if (!projectSlug) {
      return handleResponse(404, routes.dashboard.root(), "Project not found");
    }

    // Get business rules to determine if song is required
    const businessRules = await getProjectBusinessRules(projectSlug);
    const schema = businessRules.requireSongOnSignup ? nonLoggedInSchema : nonLoggedInSchemaNoSong;

    logger.info("Resolved business rules and validation schema", {
      component: "signupService",
      operation: "signupWithOTP",
      businessRules,
      requireSongOnSignup: businessRules.requireSongOnSignup,
      schema: businessRules.requireSongOnSignup ? "nonLoggedInSchema" : "nonLoggedInSchemaNoSong",
    });

    // Validate form data with the appropriate schema
    const validation = validateFormData(formData, schema);

    if (!validation.success) {
      logger.warn("OTP signup validation failed", { component: "signupService", operation: "signupWithOTP", error: validation.error });
      return handleResponse(400, routes.dashboard.root(), validation.error);
    }

    const validData = validation.data;

    // Validate referral code (REQUIRED for all new signups)
    const referralCode = formData.get('referralCode')?.toString();

    if (!referralCode) {
      return handleResponse(
        400,
        routes.dashboard.root(),
        "A referral code is required to create an account. Please ask an existing member for a referral link."
      );
    }

    const referralValidation = await validateReferralCodeForSignup(referralCode);

    if (!referralValidation.valid) {
      return handleResponse(
        400,
        routes.dashboard.root(),
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
      return handleResponse(400, routes.dashboard.root(), error.message);
    }
    
    return handleResponse(200, routes.dashboard.root(), "Please check your email for a verification link to complete your signup.");
  } catch (error) {
    return handleResponse(500, routes.dashboard.root(), (error as Error).message);
  }
}

// Verify signup with user email
export async function signupUserWithoutSong(props: { projectId: string, roundId: number, userId: string, additionalComments?: string }): Promise<FormReturn> {
  "use server";

  const { projectId, roundId, userId, additionalComments = "" } = props;

  if (!userId) {
    return handleResponse(401, routes.dashboard.root(), "User ID is required for signup");
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

      return handleResponse(200, routes.dashboard.root(), "You have successfully signed up for this round!");
    } else {
      // Check signup cap before allowing new signup
      const capCheck = await checkSignupCap(roundId);
      if (!capCheck.canSignup) {
        return handleResponse(400, routes.dashboard.root(), capCheck.message || "Cannot signup for this round");
      }

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

      return handleResponse(200, routes.dashboard.root(), "You have successfully signed up for this round!");
    }
  } catch (error) {
    return handleResponse(500, routes.dashboard.root(), (error as Error).message);
  }
}

export async function verifySignupByEmail(): Promise<FormReturn> {
  "use server";

  const { userId, email } = await getAuthUser();

  if (!userId || !email) {
    return handleResponse(401, routes.dashboard.root(), "You must be authenticated to complete signup");
  }

  try {
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
      return handleResponse(404, routes.dashboard.root(), "No pending signup found for your email");
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
      logger.info("Creating new user in database", { component: "signupService", userId, email });
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
        logger.info("Backfilling publicDisplayName from Supabase metadata", { component: "signupService", operation: "verifySignupByEmail", userId });
        await db
          .update(users)
          .set({ publicDisplayName })
          .where(eq(users.userid, userId));
      }
    }
    
    const signupData = unverifiedSignup[0];

    // Check signup cap before allowing new signup
    const capCheck = await checkSignupCap(signupData.roundId);
    if (!capCheck.canSignup) {
      logger.info("Signup cap reached", { component: "signupService", operation: "verifySignupByEmail", capCheck });
      return handleResponse(400, routes.dashboard.root(), capCheck.message || "Cannot signup for this round");
    }

    // Get the project ID from the round
    const roundResult = await db
      .select({ projectId: roundMetadata.projectId })
      .from(roundMetadata)
      .where(eq(roundMetadata.id, signupData.roundId))
      .limit(1);

    if (!roundResult.length) {
      return handleResponse(404, routes.dashboard.root(), "Round not found");
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
      logger.error("Failed to send confirmation email", { component: "signupService", operation: "verifySignupByEmail", error: emailError });
      // Don't fail the signup if email fails
    }

    // Record the referral if a referral code was provided
    if (signupData.referralCode) {
      const referralResult = await recordReferralForSignup(userId, signupData.referralCode);
      if (!referralResult.success) {
        logger.error("Failed to record referral", { component: "signupService", message: referralResult.message });
        // We don't fail the signup if referral recording fails, just log it
      }
    }

    // Delete the unverified signup record
    await db.delete(unverifiedSignups)
      .where(eq(unverifiedSignups.email, email));

    return handleResponse(200, routes.dashboard.root(), "Your signup has been verified successfully!");
  } catch (error) {
    return handleResponse(500, routes.dashboard.root(), (error as Error).message);
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
    return handleResponse(401, routes.dashboard.root(), "You must be authenticated to complete signup");
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
    return handleResponse(500, routes.dashboard.root(), (error as Error).message);
  }
}

export async function adminSignupUser(formData: FormData): Promise<FormReturn> {
  "use server";
  
  logger.info("adminSignupUser started", { component: "signupService", operation: "adminSignupUser" });
  
  try {
    // Extract and validate form data
    const userId = formData.get("userId")?.toString() || "";
    const roundId = Number(formData.get("roundId")?.toString() || "-1");
    const providedSongId = formData.get("songId")?.toString();
    const songTitle = formData.get("songTitle")?.toString() || "";
    const artist = formData.get("artist")?.toString() || "";
    const youtubeLink = formData.get("youtubeLink")?.toString() || "";
    const additionalComments = formData.get("additionalComments")?.toString() || "";
    
    logger.info("Called with form data", { component: "signupService", operation: "adminSignupUser", userId, roundId, providedSongId, songTitle, artist });
    
    if (!userId) {
      return { status: "Error", message: "User ID is required" };
    }
    
    if (roundId < 0) {
      return { status: "Error", message: "Valid Round ID is required" };
    }
    
    let songId: number;
    
    // Check if signing up without a song
    if (providedSongId === "-1") {
      logger.info("Signing up without a song", { component: "signupService" });
      songId = -1;
      logger.info("Set songId to -1", { component: "signupService" });
    } else {
      logger.info("Creating new song", { component: "signupService" });
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

    // Get the project ID from the round
    logger.info("Getting project ID from round", { component: "signupService" });
    const roundResult = await db
      .select({ projectId: roundMetadata.projectId })
      .from(roundMetadata)
      .where(eq(roundMetadata.id, roundId))
      .limit(1);

    if (!roundResult.length) {
      return { status: "Error", message: "Round not found" };
    }

    const projectId = roundResult[0].projectId;
    logger.info("Found projectId", { component: "signupService", projectId });

    // Check if user is already signed up for this round
    logger.info("Checking for existing signup", { component: "signupService" });
    const existingSignup = await db
      .select()
      .from(signUps)
      .where(and(
        eq(signUps.userId, userId),
        eq(signUps.roundId, roundId)
      ));
    logger.info("Existing signup check complete", { component: "signupService", existingSignupCount: existingSignup.length });

    if (existingSignup.length > 0) {
      return { status: "Error", message: "User is already signed up for this round" };
    }

    // Insert the signup using raw SQL to avoid ID generation issues
    logger.info("Inserting signup", { component: "signupService", songId, projectId });

    try {
      const result = await db.execute(sql`
        INSERT INTO sign_ups (id, project_id, youtube_link, additional_comments, round_id, song_id, user_id, created_at)
        VALUES (
          (SELECT COALESCE(MAX(id), 0) + 1 FROM sign_ups),
          ${projectId},
          ${youtubeLink || ""},
          ${additionalComments || ""},
          ${roundId},
          ${songId},
          ${userId},
          NOW()
        )
        RETURNING id
      `);
      logger.info("Signup inserted successfully", { component: "signupService", result });
    } catch (insertError) {
      logger.error("Insert error", { component: "signupService", error: insertError });
      throw insertError;
    }

    const successMessage = songId === -1 
      ? "User has been successfully signed up for the round without a song!" 
      : "User has been successfully signed up for the round!";
    
    logger.info("adminSignupUser succeeded", { component: "signupService", operation: "adminSignupUser" });
    return { status: "Success", message: successMessage };
  } catch (error) {
    logger.error("adminSignupUser failed", { component: "signupService", operation: "adminSignupUser", error });
    return { status: "Error", message: (error as Error).message };
  }
}


export async function signup(formData: FormData, providedUserId?: string): Promise<FormReturn> {
  "use server";
  // Use provided userId if available, otherwise get from auth
  const { userId: authUserId, email: authEmail } = await getAuthUser();
  const userId = providedUserId || authUserId;
  
  if (!userId) {
    return handleResponse(401, routes.dashboard.root(), "User ID is required for signup");
  }
  
  try {
    // Get the round ID early to fetch project config
    const roundId = Number(formData.get("roundId"));
    logger.info("Starting signup", { component: "signupService", operation: "signup", roundId, userId });

    if (!roundId || isNaN(roundId)) {
      logger.error("Invalid round ID", { component: "signupService", operation: "signup", rawRoundId: formData.get("roundId") });
      return handleResponse(400, routes.dashboard.root(), "Invalid round ID");
    }

    // Get the project ID from the round
    const roundResult = await db
      .select({ projectId: roundMetadata.projectId })
      .from(roundMetadata)
      .where(eq(roundMetadata.id, roundId))
      .limit(1);

    if (!roundResult.length) {
      logger.error("Round not found", { component: "signupService", operation: "signup", roundId });
      return handleResponse(404, routes.dashboard.root(), "Round not found");
    }

    const projectId = roundResult[0].projectId;
    logger.info("Found projectId", { component: "signupService", operation: "signup", projectId });

    // Get project slug and business rules to determine schema
    const projectSlug = getProjectSlugFromId(projectId);
    if (!projectSlug) {
      logger.error("Project slug not found", { component: "signupService", operation: "signup", projectId });
      return handleResponse(404, routes.dashboard.root(), "Project not found");
    }

    const businessRules = await getProjectBusinessRules(projectSlug);
    const schema = businessRules.requireSongOnSignup ? signupSchema : signupSchemaNoSong;

    logger.info("Resolved project business rules", { component: "signupService", operation: "signup", projectSlug, requireSongOnSignup: businessRules.requireSongOnSignup });

    // Validate form data with the appropriate Zod schema
    const validation = validateFormData(formData, schema);

    if (!validation.success) {
      logger.error("Validation failed", { component: "signupService", operation: "signup", error: validation.error });
      return handleResponse(400, routes.dashboard.root(), validation.error);
    }

    const validData = validation.data;
    logger.info("Validation succeeded", { component: "signupService", operation: "signup", validData });

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

    // If this is a new signup (not an update), check signup cap
    if (existingSignup.length === 0) {
      const capCheck = await checkSignupCap(validData.roundId);
      if (!capCheck.canSignup) {
        logger.info("Signup cap reached", { component: "signupService", operation: "signup", capCheck });
        return handleResponse(400, routes.dashboard.root(), capCheck.message || "Cannot signup for this round");
      }
    }

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
      return handleResponse(200, routes.dashboard.root(), message);
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
        logger.error("Failed to send confirmation email", { component: "signupService", operation: "signup", error: emailError });
        // Don't fail the signup if email fails
      }

      return handleResponse(200, routes.dashboard.root(), "Your signup has been verified successfully!");
    }
  } catch (error) {
    logger.error("Unexpected error during signup", {
      component: "signupService",
      operation: "signup",
      error,
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return handleResponse(500, routes.dashboard.root(), `Signup failed: ${errorMessage}`);
  }
}