import { getCurrentRoundId, getSignupUsersByRound, getVoteResults, getVotingUsersByRound } from "@/data-access";

interface Props {
  roundId?: number;
}

export const votesProvider = async ({ roundId: roundIdProp }: Props) => {
  let roundId = roundIdProp;
  
  if (!roundId) {
    const currentRoundResult = await getCurrentRoundId();
    if (currentRoundResult.status !== 'success') {
      throw new Error('Failed to get current round ID');
    }
    roundId = currentRoundResult.data;
  }

  const voteResults = await getVoteResults(roundId);
  const votingUserIds = await getVotingUsersByRound(roundId);
  const usersInRound = await getSignupUsersByRound(roundId);
  const outstandingVoters = usersInRound
    ?.filter(user => !votingUserIds?.includes(user.userId))
    .map(user => user.user?.email)
    .filter((email): email is string => email !== undefined && email !== null);

  return { voteResults, outstandingVoters: outstandingVoters || [] };
};
