import { getCurrentRoundId, getSignupUsersByRound, getVoteResults, getVotingUsersByRound } from "@/data-access";

interface Props {
  roundId?: number;
}

export const votesProvider = async ({ roundId: roundIdProp }: Props) => {
  const roundId = roundIdProp || await getCurrentRoundId();
  const voteResults = await getVoteResults(
    roundId
  );

  const votingUserIds = await getVotingUsersByRound(roundId)
  const usersInRound = await getSignupUsersByRound(roundId);
  const outstandingVoters = usersInRound
    ?.filter(user => !votingUserIds?.includes(user.userId))
    .map(user => user.user?.email)
    .filter((email): email is string => email !== undefined && email !== null);

  return { voteResults, outstandingVoters: outstandingVoters || [] };
};
