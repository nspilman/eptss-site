"use server";
import { getCurrentRoundId, getRoundDataForUser, signup, submitCover, submitVotes, signupWithOTP, completeSignupAfterVerification, verifySignupByEmail, getVotesByUserForRound } from "@/data-access";
import { getAuthUser } from "@/utils/supabase/server";

// Define a custom hook for easy access to the UserSessionContext
interface Props {
  roundId?: number;
}

interface UserParticipationData {
  signup: typeof signup;
  signupWithOTP: typeof signupWithOTP;
  completeSignupAfterVerification: typeof completeSignupAfterVerification;
  verifySignupByEmail: typeof verifySignupByEmail;
  submitCover: typeof submitCover;
  submitVotes: typeof submitVotes;
  roundDetails?: Awaited<ReturnType<typeof getRoundDataForUser>>;
  userVotes?: Awaited<ReturnType<typeof getVotesByUserForRound>>;
}

export const userParticipationProvider = async (props?: Props): Promise<UserParticipationData> => {
  const roundIdOverride = props?.roundId;
  const { userId } = getAuthUser();

  const services = {
    signup,
    signupWithOTP,
    completeSignupAfterVerification,
    verifySignupByEmail,
    submitCover,
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
