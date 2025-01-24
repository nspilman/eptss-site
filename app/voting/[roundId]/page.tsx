import { roundProvider, userParticipationProvider } from "@/providers";
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

  const {roundDetails} = await userParticipationProvider({ roundId });

  return (
    <VotingPage
      roundId={roundId}
      voteOptions={voteOptions.map(option => ({...option, field: option.songId.toString(), label: option.song.title + " - " + option.song.artist}))}
      phase={phase}
      coveringStartLabel={coveringStartLabel}
      userRoundDetails={roundDetails}
    />
  );
}
