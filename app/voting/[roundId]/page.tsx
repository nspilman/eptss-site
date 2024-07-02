import { roundProvider } from "@/providers";
import VotingPage from "../VotingPage";

export default async function VotingForRound({
  params,
}: {
  params: { roundId: string };
}) {
  const {
    roundId,
    dateLabels: {
      covering: { opens: coveringStartLabel },
    },
    voteOptions,
    phase,
  } = await roundProvider(parseInt(params.roundId));

  if (!roundId) {
    return <div>Round not found</div>;
  }

  return (
    <VotingPage
      roundId={roundId}
      voteOptions={voteOptions}
      phase={phase}
      coveringStartLabel={coveringStartLabel}
    />
  );
}
