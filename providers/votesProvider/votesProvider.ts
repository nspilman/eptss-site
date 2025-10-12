import { getCurrentRound, getRoundBySlug, getSignupUsersByRound, getVoteResults, getVotingUsersByRound, getVoteBreakdownBySong } from "@/data-access";

interface Props {
  roundSlug?: string;
}

export const votesProvider = async ({ roundSlug }: Props) => {
  try {
    const roundResult = roundSlug ? await getRoundBySlug(roundSlug) : await getCurrentRound();
    if (roundResult.status !== 'success') {
      throw new Error(`Failed to get round: ${roundResult.error?.message || 'Unknown error'}`);
    }
    const targetRoundId = roundResult.data.roundId;

    const voteResults = await getVoteResults(targetRoundId);
    const votingUserIds = await getVotingUsersByRound(targetRoundId);
    const usersInRound = await getSignupUsersByRound(targetRoundId);
    const voteBreakdown = await getVoteBreakdownBySong(targetRoundId);
    const outstandingVoters = usersInRound
      ?.filter(user => !votingUserIds?.includes(user.userId))
      .map(user => user.user?.email)
      .filter((email): email is string => email !== undefined && email !== null);

    return { 
      voteResults, 
      outstandingVoters: outstandingVoters || [], 
      voteBreakdown 
    };
  } catch (error) {
    console.error("Error in votesProvider:", error);
    return { voteResults: [], outstandingVoters: [], voteBreakdown: [] };
  }
};
