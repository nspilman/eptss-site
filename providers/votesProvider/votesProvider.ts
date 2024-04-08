import { getCurrentRoundId, getVoteResults } from "@/data-access";

interface Props {
  roundId?: number;
}

export const votesProvider = async ({ roundId }: Props) => {
  const voteResults = await getVoteResults(
    roundId || (await getCurrentRoundId())
  );

  return { voteResults };
};
