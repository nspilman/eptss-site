"use server";

import { 
  signup as signupService, 
  submitCover as submitCoverService, 
  submitVotes as submitVotesService,
  signupWithOTP as signupWithOTPService,
  completeSignupAfterVerification as completeSignupAfterVerificationService,
  verifySignupByEmail as verifySignupByEmailService,
  getUserInfo,
  getRoundInfo,
  getSongsByIds,
  getMostRecentSignupForUser,
} from "@/data-access";
import { getAuthUser } from "@/utils/supabase/server";
import { 
  sendVotingConfirmation, 
  sendSubmissionConfirmation, 
  sendRoundSignupConfirmation 
} from "@/services/emailService";
import { formatDate } from "@/services/dateService";
import { FormReturn } from "@/types";
import { revalidatePath } from "next/cache";
import { signupSchema } from "@/schemas/signupSchemas";
import { validateFormData } from "@/utils/formDataHelpers";
import { submitVotesSchema, submitCoverSchema, signupWithSongSchema, signupWithOTPSchema } from "@/lib/schemas/actionSchemas";
import { votingRateLimit, submissionRateLimit, signupRateLimit, emailRateLimit } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

/**
 * Server Action: Submit votes for a round
 * Includes email confirmation on success
 */
export async function submitVotes(roundId: number, formData: FormData): Promise<FormReturn> {
  try {
    // 1. Authenticate
    const { userId } = await getAuthUser();
    if (!userId) {
      return { status: "Error", message: "Please log in to vote" };
    }
    
    // 2. Validate input
    const validation = submitVotesSchema.safeParse({ roundId });
    if (!validation.success) {
      logger.warn('Vote validation failed', { errors: validation.error.errors });
      return { 
        status: "Error", 
        message: validation.error.errors[0].message 
      };
    }
    
    // 3. Rate limit
    const { success } = await votingRateLimit.limit(`vote:${userId}`);
    if (!success) {
      logger.warn('Voting rate limit exceeded', { userId, roundId });
      return { 
        status: "Error", 
        message: "Too many voting attempts. Please try again later." 
      };
    }
    
    // 4. Submit votes
    const result = await submitVotesService(roundId, formData);
    
    if (result.status !== 'Success') {
      logger.error('Vote submission failed', { userId, roundId });
      return result;
    }
    
    // 5. Send confirmation email (non-blocking)
    try {
      const [userInfo, roundInfo] = await Promise.all([
        getUserInfo(userId),
        getRoundInfo(roundId),
      ]);
      
      if (userInfo && roundInfo) {
        // Extract voted songs from formData
        const votedSongIds = Array.from(formData.entries())
          .filter(([key]) => key.startsWith('song-'))
          .map(([key]) => Number(key.replace('song-', '')));

        const votedSongsData = await getSongsByIds(votedSongIds);

        const votedSongs = votedSongsData.map(song => {
          const voteEntry = Array.from(formData.entries())
            .find(([key]) => key === `song-${song.id}`);
          return {
            title: song.title,
            artist: song.artist,
            rating: voteEntry ? Number(voteEntry[1]) : 0,
          };
        });

        await sendVotingConfirmation({
          userEmail: userInfo.email,
          userName: userInfo.username,
          roundName: roundInfo.slug || `Round ${roundId}`,
          roundSlug: roundInfo.slug || roundId.toString(),
          votedSongs,
          phaseDates: {
            coveringBegins: formatDate.compact(roundInfo.coveringBegins || new Date()),
            coversDue: formatDate.compact(roundInfo.coversDue || new Date()),
            listeningParty: formatDate.compact(roundInfo.listeningParty || new Date()),
          },
        });
      }
    } catch (emailError) {
      logger.error('Failed to send voting confirmation', { 
        userId, 
        roundId, 
        error: emailError 
      });
      // Don't fail the action if email fails
    }
    
    // 6. Revalidate cache
    revalidatePath(`/voting/${roundId}`);
    
    // 7. Log success
    logger.info('Votes submitted', { userId, roundId });
    
    return result;
    
  } catch (error) {
    logger.error('Vote submission error', {
      error: error instanceof Error ? error.message : 'Unknown',
      roundId,
    });
    
    return { 
      status: "Error", 
      message: "Failed to submit votes. Please try again." 
    };
  }
}

/**
 * Server Action: Submit a cover for a round
 * Includes email confirmation on success
 */
export async function submitCover(formData: FormData): Promise<FormReturn> {
  try {
    // 1. Authenticate
    const { userId } = await getAuthUser();
    if (!userId) {
      return { status: "Error", message: "Please log in to submit a cover" };
    }
    
    // 2. Validate input
    const roundId = Number(formData.get("roundId")?.toString() || "-1");
    const validation = submitCoverSchema.safeParse({
      roundId: formData.get("roundId"),
      soundcloudUrl: formData.get("soundcloudUrl"),
      coolThingsLearned: formData.get("coolThingsLearned"),
      toolsUsed: formData.get("toolsUsed"),
      happyAccidents: formData.get("happyAccidents"),
      didntWork: formData.get("didntWork"),
    });
    
    if (!validation.success) {
      logger.warn('Cover submission validation failed', { errors: validation.error.errors });
      return { 
        status: "Error", 
        message: validation.error.errors[0].message 
      };
    }
    
    // 3. Rate limit
    const { success } = await submissionRateLimit.limit(`submission:${userId}`);
    if (!success) {
      logger.warn('Submission rate limit exceeded', { userId, roundId });
      return { 
        status: "Error", 
        message: "Too many submission attempts. Please try again later." 
      };
    }
    
    // 4. Submit cover
    const result = await submitCoverService(formData);
    
    if (result.status !== 'Success') {
      logger.error('Cover submission failed', { userId, roundId });
      return result;
    }
    
    // 5. Send confirmation email (non-blocking)
    try {
      const [userInfo, roundInfo] = await Promise.all([
        getUserInfo(userId),
        getRoundInfo(roundId),
      ]);
      
      if (userInfo && roundInfo) {
        const soundcloudUrl = formData.get("soundcloudUrl")?.toString() || "";
        
        await sendSubmissionConfirmation({
          userEmail: userInfo.email,
          userName: userInfo.username,
          roundName: roundInfo.slug || `Round ${roundId}`,
          roundSlug: roundInfo.slug || roundId.toString(),
          soundcloudUrl,
          additionalComments: {
            coolThingsLearned: formData.get("coolThingsLearned")?.toString(),
            toolsUsed: formData.get("toolsUsed")?.toString(),
            happyAccidents: formData.get("happyAccidents")?.toString(),
            didntWork: formData.get("didntWork")?.toString(),
          },
          listeningPartyDate: formatDate.compact(roundInfo.listeningParty || new Date()),
        });
      }
    } catch (emailError) {
      logger.error('Failed to send submission confirmation', { 
        userId, 
        roundId, 
        error: emailError 
      });
    }
    
    // 6. Revalidate cache
    const roundSlug = formData.get("roundSlug")?.toString();
    if (roundSlug) {
      revalidatePath(`/round/${roundSlug}`);
    }
    
    // 7. Log success
    logger.info('Cover submitted', { userId, roundId });
    
    return result;
    
  } catch (error) {
    logger.error('Cover submission error', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
    
    return { 
      status: "Error", 
      message: "Failed to submit cover. Please try again." 
    };
  }
}

/**
 * Server Action: Sign up for a round
 * Includes email confirmation on success
 */
export async function signup(formData: FormData, providedUserId?: string): Promise<FormReturn> {
  const { userId } = await getAuthUser();
  const result = await signupService(formData, providedUserId);
  
  if (result.status === 'Success' && userId) {
    try {
      const roundId = Number(formData.get("roundId")?.toString() || "-1");
      const songTitle = formData.get("songTitle")?.toString() || "";
      const artist = formData.get("artist")?.toString() || "";
      const youtubeLink = formData.get("youtubeLink")?.toString() || "";
      
      const [userInfo, roundInfo] = await Promise.all([
        getUserInfo(userId),
        getRoundInfo(roundId),
      ]);

      if (userInfo && roundInfo) {

        await sendRoundSignupConfirmation({
          to: userInfo.email,
          userName: userInfo.username,
          roundName: roundInfo.slug || `Round ${roundId}`,
          songTitle,
          artist,
          youtubeLink,
          roundSlug: roundInfo.slug || roundId.toString(),
          phaseDates: {
            votingOpens: formatDate.compact(roundInfo.votingOpens || new Date()),
            coveringBegins: formatDate.compact(roundInfo.coveringBegins || new Date()),
            coversDue: formatDate.compact(roundInfo.coversDue || new Date()),
            listeningParty: formatDate.compact(roundInfo.listeningParty || new Date()),
          },
        });
      }
    } catch (error) {
      console.error('Failed to send signup confirmation email:', error);
    }
    
    // Revalidate relevant pages
    const roundSlug = formData.get("roundSlug")?.toString();
    if (roundSlug) {
      revalidatePath(`/round/${roundSlug}`);
    }
    revalidatePath('/dashboard');
  }
  
  return result;
}

/**
 * Server Action: Sign up with OTP (for unverified users)
 */
export async function signupWithOTP(formData: FormData): Promise<FormReturn> {
  try {
    // 1. Validate input
    const validation = signupWithOTPSchema.safeParse({
      roundId: formData.get("roundId"),
      email: formData.get("email"),
      songTitle: formData.get("songTitle"),
      artist: formData.get("artist"),
      youtubeLink: formData.get("youtubeLink"),
    });
    
    if (!validation.success) {
      logger.warn('OTP signup validation failed', { errors: validation.error.errors });
      return { 
        status: "Error", 
        message: validation.error.errors[0].message 
      };
    }
    
    // 2. Rate limit by email
    const email = formData.get("email")?.toString() || "";
    const { success } = await emailRateLimit.limit(`otp-signup:${email}`);
    if (!success) {
      logger.warn('OTP signup rate limit exceeded', { email });
      return { 
        status: "Error", 
        message: "Too many signup attempts. Please try again later." 
      };
    }
    
    // 3. Process signup
    const result = await signupWithOTPService(formData);
    
    if (result.status !== 'Success') {
      logger.error('OTP signup failed', { email });
      return result;
    }
    
    // 4. Revalidate cache
    const roundSlug = formData.get("roundSlug")?.toString();
    if (roundSlug) {
      revalidatePath(`/sign-up/${roundSlug}`);
    }
    
    // 5. Log success
    logger.info('OTP signup initiated', { email });
    
    return result;
    
  } catch (error) {
    logger.error('OTP signup error', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
    
    return { 
      status: "Error", 
      message: "Failed to process signup. Please try again." 
    };
  }
}

/**
 * Server Action: Complete signup after email verification
 */
export async function completeSignupAfterVerification(formData: FormData): Promise<FormReturn> {
  try {
    // 1. Authenticate
    const { userId } = await getAuthUser();
    if (!userId) {
      return { status: "Error", message: "Please log in to complete signup" };
    }
    
    // 2. Validate FormData with Zod
    const validation = validateFormData(formData, signupSchema);
    
    if (!validation.success) {
      logger.warn('Signup completion validation failed', { 
        userId,
        error: validation.error 
      });
      return { status: 'Error', message: validation.error };
    }
    
    // 3. Rate limit
    const { success } = await signupRateLimit.limit(`complete-signup:${userId}`);
    if (!success) {
      logger.warn('Signup completion rate limit exceeded', { userId });
      return { 
        status: "Error", 
        message: "Too many attempts. Please try again later." 
      };
    }
    
    // 4. Complete signup
    const result = await completeSignupAfterVerificationService(validation.data);
    
    if (result.status !== 'Success') {
      logger.error('Signup completion failed', { userId });
      return result;
    }
    
    // 5. Revalidate cache
    revalidatePath('/dashboard');
    
    // 6. Log success
    logger.info('Signup completed after verification', { userId });
    
    return result;
    
  } catch (error) {
    logger.error('Signup completion error', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
    
    return { 
      status: "Error", 
      message: "Failed to complete signup. Please try again." 
    };
  }
}

/**
 * Server Action: Verify signup by email
 * Includes email confirmation on success
 */
export async function verifySignupByEmail(): Promise<FormReturn> {
  const { userId } = await getAuthUser();
  const result = await verifySignupByEmailService();
  
  if (result.status === 'Success' && userId) {
    try {
      const [userInfo, signupData] = await Promise.all([
        getUserInfo(userId),
        getMostRecentSignupForUser(userId),
      ]);

      if (userInfo && signupData) {
        const roundInfo = await getRoundInfo(signupData.roundId);

        if (roundInfo) {

          await sendRoundSignupConfirmation({
            to: userInfo.email,
            userName: userInfo.username,
            roundName: roundInfo.slug || `Round ${signupData.roundId}`,
            songTitle: signupData.songTitle || "",
            artist: signupData.artist || "",
            youtubeLink: signupData.youtubeLink,
            roundSlug: roundInfo.slug || signupData.roundId.toString(),
            phaseDates: {
              votingOpens: formatDate.compact(roundInfo.votingOpens || new Date()),
              coveringBegins: formatDate.compact(roundInfo.coveringBegins || new Date()),
              coversDue: formatDate.compact(roundInfo.coversDue || new Date()),
              listeningParty: formatDate.compact(roundInfo.listeningParty || new Date()),
            },
          });
        }
      }
    } catch (error) {
      console.error('Failed to send signup verification email:', error);
    }
    
    revalidatePath('/dashboard');
  }
  
  return result;
}
