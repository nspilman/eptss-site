"use server";

import { 
  signup as signupService, 
  submitCover as submitCoverService, 
  submitVotes as submitVotesService,
  signupWithOTP as signupWithOTPService,
  completeSignupAfterVerification as completeSignupAfterVerificationService,
  verifySignupByEmail as verifySignupByEmailService
} from "@/data-access";
import { getAuthUser } from "@/utils/supabase/server";
import { 
  sendVotingConfirmation, 
  sendSubmissionConfirmation, 
  sendRoundSignupConfirmation 
} from "@/services/emailService";
import { db } from "@/db";
import { users, roundMetadata, songs, signUps } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { formatDate } from "@/services/dateService";
import { FormReturn } from "@/types";
import { revalidatePath } from "next/cache";
import { signupSchema } from "@/schemas/signupSchemas";
import { validateFormData } from "@/utils/formDataHelpers";

/**
 * Server Action: Submit votes for a round
 * Includes email confirmation on success
 */
export async function submitVotes(roundId: number, formData: FormData): Promise<FormReturn> {
  const { userId } = await getAuthUser();
  const result = await submitVotesService(roundId, formData);
  
  if (result.status === 'Success' && userId) {
    try {
      const userInfo = await db
        .select({ email: users.email, username: users.username })
        .from(users)
        .where(eq(users.userid, userId))
        .limit(1);

      const roundInfo = await db
        .select({
          slug: roundMetadata.slug,
          coveringBegins: roundMetadata.coveringBegins,
          coversDue: roundMetadata.coversDue,
          listeningParty: roundMetadata.listeningParty,
        })
        .from(roundMetadata)
        .where(eq(roundMetadata.id, roundId))
        .limit(1);

      const votedSongIds = Array.from(formData.entries())
        .filter(([key]) => key.startsWith('song-'))
        .map(([key]) => Number(key.replace('song-', '')));

      const votedSongsData = await db
        .select({ id: songs.id, title: songs.title, artist: songs.artist })
        .from(songs)
        .where(sql`${songs.id} IN (${sql.join(votedSongIds.map(id => sql`${id}`), sql`, `)})`)
        .execute();

      if (userInfo.length > 0 && roundInfo.length > 0) {
        const user = userInfo[0];
        const round = roundInfo[0];
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
          userEmail: user.email,
          userName: user.username,
          roundName: round.slug || `Round ${roundId}`,
          roundSlug: round.slug || roundId.toString(),
          votedSongs,
          phaseDates: {
            coveringBegins: formatDate.compact(round.coveringBegins || new Date()),
            coversDue: formatDate.compact(round.coversDue || new Date()),
            listeningParty: formatDate.compact(round.listeningParty || new Date()),
          },
        });
      }
    } catch (error) {
      console.error('Failed to send voting confirmation email:', error);
    }
    
    // Revalidate the voting page
    revalidatePath(`/voting/${roundId}`);
  }
  
  return result;
}

/**
 * Server Action: Submit a cover for a round
 * Includes email confirmation on success
 */
export async function submitCover(formData: FormData): Promise<FormReturn> {
  const { userId } = await getAuthUser();
  const result = await submitCoverService(formData);
  
  if (result.status === 'Success' && userId) {
    try {
      const roundId = Number(formData.get("roundId")?.toString() || "-1");
      const soundcloudUrl = formData.get("soundcloudUrl")?.toString() || "";
      
      const userInfo = await db
        .select({ email: users.email, username: users.username })
        .from(users)
        .where(eq(users.userid, userId))
        .limit(1);

      const roundInfo = await db
        .select({ slug: roundMetadata.slug, listeningParty: roundMetadata.listeningParty })
        .from(roundMetadata)
        .where(eq(roundMetadata.id, roundId))
        .limit(1);

      if (userInfo.length > 0 && roundInfo.length > 0) {
        const user = userInfo[0];
        const round = roundInfo[0];

        await sendSubmissionConfirmation({
          userEmail: user.email,
          userName: user.username,
          roundName: round.slug || `Round ${roundId}`,
          roundSlug: round.slug || roundId.toString(),
          soundcloudUrl,
          additionalComments: {
            coolThingsLearned: formData.get("coolThingsLearned")?.toString(),
            toolsUsed: formData.get("toolsUsed")?.toString(),
            happyAccidents: formData.get("happyAccidents")?.toString(),
            didntWork: formData.get("didntWork")?.toString(),
          },
          listeningPartyDate: formatDate.compact(round.listeningParty || new Date()),
        });
      }
    } catch (error) {
      console.error('Failed to send submission confirmation email:', error);
    }
    
    // Revalidate the round page
    const roundSlug = formData.get("roundSlug")?.toString();
    if (roundSlug) {
      revalidatePath(`/round/${roundSlug}`);
    }
  }
  
  return result;
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
      
      const userInfo = await db
        .select({ email: users.email, username: users.username })
        .from(users)
        .where(eq(users.userid, userId))
        .limit(1);

      const roundInfo = await db
        .select({
          slug: roundMetadata.slug,
          votingOpens: roundMetadata.votingOpens,
          coveringBegins: roundMetadata.coveringBegins,
          coversDue: roundMetadata.coversDue,
          listeningParty: roundMetadata.listeningParty,
        })
        .from(roundMetadata)
        .where(eq(roundMetadata.id, roundId))
        .limit(1);

      if (userInfo.length > 0 && roundInfo.length > 0) {
        const user = userInfo[0];
        const round = roundInfo[0];

        await sendRoundSignupConfirmation({
          to: user.email,
          userName: user.username,
          roundName: round.slug || `Round ${roundId}`,
          songTitle,
          artist,
          youtubeLink,
          roundSlug: round.slug || roundId.toString(),
          phaseDates: {
            votingOpens: formatDate.compact(round.votingOpens || new Date()),
            coveringBegins: formatDate.compact(round.coveringBegins || new Date()),
            coversDue: formatDate.compact(round.coversDue || new Date()),
            listeningParty: formatDate.compact(round.listeningParty || new Date()),
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
  const result = await signupWithOTPService(formData);
  
  // Revalidate the sign-up page
  if (result.status === 'Success') {
    const roundSlug = formData.get("roundSlug")?.toString();
    if (roundSlug) {
      revalidatePath(`/sign-up/${roundSlug}`);
    }
  }
  
  return result;
}

/**
 * Server Action: Complete signup after email verification
 */
export async function completeSignupAfterVerification(formData: FormData): Promise<FormReturn> {
  // Validate FormData with Zod
  const validation = validateFormData(formData, signupSchema);
  
  if (!validation.success) {
    return { status: 'Error', message: validation.error };
  }
  
  const result = await completeSignupAfterVerificationService(validation.data);
  
  if (result.status === 'Success') {
    revalidatePath('/dashboard');
  }
  
  return result;
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
      const userInfo = await db
        .select({ email: users.email, username: users.username })
        .from(users)
        .where(eq(users.userid, userId))
        .limit(1);

      if (userInfo.length > 0) {
        const user = userInfo[0];
        
        // Get the most recent signup data to find round and song info
        const signupData = await db
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

        if (signupData.length > 0) {
          const signup = signupData[0];
          
          const roundInfo = await db
            .select({
              slug: roundMetadata.slug,
              votingOpens: roundMetadata.votingOpens,
              coveringBegins: roundMetadata.coveringBegins,
              coversDue: roundMetadata.coversDue,
              listeningParty: roundMetadata.listeningParty,
            })
            .from(roundMetadata)
            .where(eq(roundMetadata.id, signup.roundId))
            .limit(1);

          if (roundInfo.length > 0) {
            const round = roundInfo[0];

            await sendRoundSignupConfirmation({
              to: user.email,
              userName: user.username,
              roundName: round.slug || `Round ${signup.roundId}`,
              songTitle: signup.songTitle || "",
              artist: signup.artist || "",
              youtubeLink: signup.youtubeLink,
              roundSlug: round.slug || signup.roundId.toString(),
              phaseDates: {
                votingOpens: formatDate.compact(round.votingOpens || new Date()),
                coveringBegins: formatDate.compact(round.coveringBegins || new Date()),
                coversDue: formatDate.compact(round.coversDue || new Date()),
                listeningParty: formatDate.compact(round.listeningParty || new Date()),
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to send signup verification email:', error);
    }
    
    revalidatePath('/dashboard');
  }
  
  return result;
}
