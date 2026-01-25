"use server";

import { getCurrentRoundId } from "@eptss/rounds/services";
import { getRoundDataForUser } from "../../services";
import { getVotesByUserForRound } from "@eptss/voting/services";
import { getAuthUser } from "../../utils/supabase/server";

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
  projectId?: string;
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
  const projectId = props?.projectId;
  const { userId } = await getAuthUser();

  // If no user is logged in, return empty data
  if (!userId) {
    return {};
  }

  // Get the round ID (either from props or current round)
  // If projectId is not provided, getCurrentRoundId will need to be called with a default or throw
  const roundIdResult = projectId ? await getCurrentRoundId(projectId) : { status: 'error' as const };
  
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
