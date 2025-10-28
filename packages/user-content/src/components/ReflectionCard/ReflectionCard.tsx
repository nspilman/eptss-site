import { getUserReflectionsForRound, roundProvider } from "@eptss/data-access";
import { getAuthUser } from "@eptss/data-access/utils/supabase/server";
import { ReflectionDisplay } from "./ReflectionDisplay";

export async function ReflectionCard() {
  const [
    currentRound,
    { userId }
  ] = await Promise.all([
    roundProvider(),
    getAuthUser()
  ]);

  // Don't show if no current round
  if (!currentRound || !currentRound.roundId) {
    return null;
  }

  // Get all user reflections for this round
  const reflectionsResult = await getUserReflectionsForRound(userId, currentRound.roundId);
  const reflections = reflectionsResult.status === 'success' ? reflectionsResult.data : [];

  return (
    <ReflectionDisplay
      roundSlug={currentRound.slug}
      round={currentRound}
      reflections={reflections}
    />
  );
}
