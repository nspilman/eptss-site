import { getCurrentRound, getRoundBySlug, getSignupUsersByRound, getVoteResults, getVotingUsersByRound } from "@/data-access";

interface Props {
  roundSlug?: string;
  roundId?: number;
}

export const votesProvider = async ({ roundSlug, roundId }: Props) => {
  try {
    // If roundId is provided directly, use it
    // Otherwise, get the round by slug or get the current round
    let targetRoundId: number;
    
    if (roundId) {
      targetRoundId = roundId;
    } else {
      const roundResult = roundSlug ? await getRoundBySlug(roundSlug) : await getCurrentRound();
      if (roundResult.status !== 'success') {
        throw new Error(`Failed to get round: ${roundResult.error?.message || 'Unknown error'}`);
      }
      targetRoundId = roundResult.data.roundId;
    }

    const voteResults = await getVoteResults(targetRoundId);
    const votingUserIds = await getVotingUsersByRound(targetRoundId);
    const usersInRound = await getSignupUsersByRound(targetRoundId);
    const outstandingVoters = usersInRound
      ?.filter(user => !votingUserIds?.includes(user.userId))
      .map(user => user.user?.email)
      .filter((email): email is string => email !== undefined && email !== null);

    return { voteResults, outstandingVoters: outstandingVoters || [] };
  } catch (error) {
    console.error("Error in votesProvider:", error);
    return { voteResults: [], outstandingVoters: [] };
  }
};
