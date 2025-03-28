import { roundProvider, userParticipationProvider } from "@/providers";
import {VotingPage} from "../VotingPage";

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

  // Provide default values when roundDetails is null
  const userRoundDetails = roundDetails ? {
    hasSubmitted: roundDetails.hasSubmitted,
    hasVoted: roundDetails.hasVoted,
    hasSignedUp: roundDetails.hasSignedUp
  } : undefined;

  return (
    <VotingPage
      roundId={roundId}
      songs={voteOptions.map(option => ({...option, id: option.songId, title: option.song.title , artist: option.song.artist})) || []}
      // phase={phase}
      coveringStartLabel={coveringStartLabel}
      userRoundDetails={userRoundDetails}
    />
  );
}
