import { getNextRoundByVotingDate, getUserSignupData } from "@/data-access";
import { getAuthUser } from "@/utils/supabase/server";
import { NextRoundDisplay } from "./NextRoundDisplay";

export async function NextRoundCard() {
  const [
    nextRoundResult,
    { userId }
  ] = await Promise.all([
    getNextRoundByVotingDate(),
    getAuthUser()
  ]);

  const nextRound = nextRoundResult.status === 'success' ? nextRoundResult.data : null;

  // Get user signup for next round if exists
  let nextRoundUserSignup = null;
  if (nextRound && userId) {
    nextRoundUserSignup = await getUserSignupData(userId, nextRound.roundId);
  }

  if (!nextRound) {
    return null;
  }

  return (
    <NextRoundDisplay
      nextRound={nextRound}
      nextRoundUserSignup={nextRoundUserSignup}
    />
  );
}
