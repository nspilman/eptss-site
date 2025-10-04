"use server";
import { getCurrentRoundId, getRoundDataForUser, signup as signupService, submitCover, submitVotes as submitVotesService, signupWithOTP, completeSignupAfterVerification, verifySignupByEmail as verifySignupByEmailService, getVotesByUserForRound } from "@/data-access";
import { getAuthUser } from "@/utils/supabase/server";
import { sendVotingConfirmation, sendSubmissionConfirmation, sendRoundSignupConfirmation } from "@/services/emailService";
import { db } from "@/db";
import { users, roundMetadata, songs, signUps } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { formatDate } from "@/services/dateService";
import { FormReturn } from "@/types";

// Define a custom hook for easy access to the UserSessionContext
interface Props {
  roundId?: number;
}

interface UserParticipationData {
  signup: (formData: FormData, providedUserId?: string) => Promise<FormReturn>;
  signupWithOTP: typeof signupWithOTP;
  completeSignupAfterVerification: typeof completeSignupAfterVerification;
  verifySignupByEmail: () => Promise<FormReturn>;
  submitCover: (formData: FormData) => Promise<FormReturn>;
  submitVotes: (roundId: number, formData: FormData) => Promise<FormReturn>;
  roundDetails?: Awaited<ReturnType<typeof getRoundDataForUser>>;
  userVotes?: Awaited<ReturnType<typeof getVotesByUserForRound>>;
}

export const userParticipationProvider = async (props?: Props): Promise<UserParticipationData> => {
  const roundIdOverride = props?.roundId;
  const { userId } = await getAuthUser();

  // Wrapper for submitVotes that sends confirmation email on success
  const submitVotes = async (roundId: number, formData: FormData): Promise<FormReturn> => {
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
    }
    
    return result;
  };

  // Wrapper for submitCover that sends confirmation email on success
  const submitCoverWithEmail = async (formData: FormData): Promise<FormReturn> => {
    const result = await submitCover(formData);
    
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
    }
    
    return result;
  };

  // Wrapper for signup that sends confirmation email on success
  const signup = async (formData: FormData, providedUserId?: string): Promise<FormReturn> => {
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
    }
    
    return result;
  };

  // Wrapper for verifySignupByEmail that sends confirmation email on success
  const verifySignupByEmail = async (): Promise<FormReturn> => {
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
    }
    
    return result;
  };

  const services = {
    signup,
    signupWithOTP,
    completeSignupAfterVerification,
    verifySignupByEmail,
    submitCover: submitCoverWithEmail,
    submitVotes,
  };

  if (!userId) {
    return services;
  }

  const roundIdResult = await getCurrentRoundId();
  // Only proceed if we have a successful result with data
  if (roundIdResult.status !== 'success') {
    return services;
  }

  const roundId = roundIdOverride ?? roundIdResult.data;

  if (typeof roundId !== 'number') {
    return services;
  }

  const roundDetails = await getRoundDataForUser(roundId);
  // Fetch the user's votes for this round
  const userVotes = await getVotesByUserForRound(roundId);
  return { ...services, roundDetails, userVotes };
};
