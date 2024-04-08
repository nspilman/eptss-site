import { roundService, votesService } from "@/data-access";

interface Props {
  roundId?: number;
}

export const votesProvider = async ({ roundId }: Props) => {
  const voteResults = await votesService.getVoteResults(
    roundId || (await roundService.getCurrentRoundId())
  );

  return { voteResults };
};
