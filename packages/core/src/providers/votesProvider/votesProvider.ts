import { getCurrentRound, getRoundBySlug, getVoteBreakdownBySong } from "@eptss/rounds/services";
import { getSignupUsersByRound } from "../../services";
import { getVoteResults, getVotingUsersByRound, getAllVotesForRound } from "@eptss/voting/services";

interface Props {
  projectId: string; // Required - must be passed from caller
  roundSlug?: string;
}

export const votesProvider = async ({ projectId, roundSlug }: Props) => {
  try {
    const roundResult = roundSlug ? await getRoundBySlug(projectId, roundSlug) : await getCurrentRound(projectId);
    if (roundResult.status !== 'success') {
      throw new Error(`Failed to get round: ${roundResult.error?.message || 'Unknown error'}`);
    }
    const targetRoundId = roundResult.data.roundId;

    const voteResults = await getVoteResults(targetRoundId);
    const votingUserIds = await getVotingUsersByRound(targetRoundId);
    const usersInRound = await getSignupUsersByRound(targetRoundId);
    const voteBreakdown = await getVoteBreakdownBySong(targetRoundId);
    const allVotes = await getAllVotesForRound(targetRoundId);
    const outstandingVoters = usersInRound
      ?.filter(user => !votingUserIds?.includes(user.userId))
      .map(user => user.user?.email)
      .filter((email): email is string => email !== undefined && email !== null);

    return { 
      voteResults, 
      outstandingVoters: outstandingVoters || [], 
      voteBreakdown,
      allVotes: allVotes || []
    };
  } catch (error) {
    console.error("Error in votesProvider:", error);
    return { voteResults: [], outstandingVoters: [], voteBreakdown: [], allVotes: [] };
  }
};
