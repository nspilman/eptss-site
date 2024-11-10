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
  const usersInRound = await getSignupUsersByRound(roundId) as unknown as {user_id: string, users: {userId: string, email: string}}[]
  const outstandingVoters = usersInRound?.filter(user => !votingUserIds?.includes(user.user_id)).map(user => user.users?.email)

  return { voteResults, outstandingVoters };
};
