import { roundProvider, userParticipationProvider, getVotesByUserForRoundWithDetails } from "@eptss/data-access";
import { getAuthUser } from "@eptss/data-access/utils/supabase/server";
import { CurrentRoundDisplay } from "./CurrentRoundDisplay";

export async function CurrentRoundCard() {
  const [
    currentRound,
    { roundDetails },
    { userId }
  ] = await Promise.all([
    roundProvider(),
    userParticipationProvider(),
    getAuthUser()
  ]);

  // Get user votes if in voting phase and has voted
  let userVotesWithDetails = null;
  if (currentRound?.phase === 'voting' && roundDetails?.hasVoted && currentRound.roundId) {
    userVotesWithDetails = await getVotesByUserForRoundWithDetails(currentRound.roundId);
  }

  return (
    <CurrentRoundDisplay
      roundInfo={currentRound}
      userRoundDetails={roundDetails}
      userId={userId}
      userVotesWithDetails={userVotesWithDetails}
    />
  );
}
