"use server";

import { getCurrentRoundId, getRoundDataForUser, getVotesByUserForRound } from "../../services";
import { getAuthUser } from "@eptss/data-access/utils/supabase/server";

/**
 * User Participation Provider - READ ONLY
 * 
 * This provider fetches user participation data for a specific round.
 * It returns information about:
 * - Round details (signups, submission status)
 * - User votes for the round
 * 
 * All mutations (signup, submitCover, submitVotes) have been moved to:
 * @see actions/userParticipationActions.ts
 */

interface Props {
  roundId?: number;
}

interface UserParticipationData {
  roundDetails?: Awaited<ReturnType<typeof getRoundDataForUser>>;
  userVotes?: Awaited<ReturnType<typeof getVotesByUserForRound>>;
}

/**
 * Get user's participation data for a round
 * @param props - Optional round ID override
 * @returns User's round details and votes (read-only data)
 */
export const userParticipationProvider = async (props?: Props): Promise<UserParticipationData> => {
  const roundIdOverride = props?.roundId;
  const { userId } = await getAuthUser();

  // If no user is logged in, return empty data
  if (!userId) {
    return {};
  }

  // Get the round ID (either from props or current round)
  const roundIdResult = await getCurrentRoundId();
  
  // If we can't get a round ID, return empty data
  if (roundIdResult.status !== 'success') {
    return {};
  }

  const roundId = roundIdOverride ?? roundIdResult.data;

  if (typeof roundId !== 'number') {
    return {};
  }

  // Fetch user's participation data for this round
  const roundDetails = await getRoundDataForUser(roundId);
  
  // Fetch the user's votes for this round
  const userVotes = await getVotesByUserForRound(roundId);

  return { 
    roundDetails, 
    userVotes 
  };
};
