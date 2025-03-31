import { roundProvider, userParticipationProvider } from "@/providers";
import {VotingPage} from "../VotingPage";

export default async function VotingForRound({
  params,
}: {
  params: { slug: string };
}) {
  const {
    roundId,
    dateLabels: {
      covering: { opens: coveringStartLabel },
    },
    voteOptions,
    phase,
  } = await roundProvider(params.slug);

  if (!roundId) {
    return <div>Round not found</div>;
  }

  if(phase !== "voting") {
    return <div>Round is not in voting phase</div>;
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
