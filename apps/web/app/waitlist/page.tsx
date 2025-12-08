import { roundProvider, roundsProvider, COVER_PROJECT_ID } from "@eptss/data-access";
import { WaitlistPageClient } from "./WaitlistPageClient";

export default async function WaitlistPage() {
  const currentRound = await roundProvider({ projectId: COVER_PROJECT_ID });

  // Get all rounds to find the next one
  const { roundContent } = await roundsProvider({ excludeCurrentRound: false, projectId: COVER_PROJECT_ID });
  
  // Sort rounds by roundId in ascending order
  const sortedRounds = [...roundContent].sort((a, b) => a.roundId - b.roundId);
  
  // Find the current round index
  const currentRoundIndex = sortedRounds.findIndex(round => round.roundId === currentRound.roundId);
  
  // Get the next round if available, otherwise use the current round
  const nextRound = currentRoundIndex !== -1 && currentRoundIndex < sortedRounds.length - 1
    ? await roundProvider({ slug: sortedRounds[currentRoundIndex + 1].slug, projectId: COVER_PROJECT_ID })
    : currentRound;
  
  const roundToDisplay = currentRound.hasRoundStarted ? nextRound : currentRound;

  return <WaitlistPageClient roundToDisplay={roundToDisplay} />;
} 