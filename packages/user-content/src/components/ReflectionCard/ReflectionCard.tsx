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

  // Serialize dates to strings for client component
  // (Date objects can't be passed from server to client components)
  const serializedRound = {
    ...currentRound,
    signupOpens: currentRound.signupOpens.toISOString(),
    votingOpens: currentRound.votingOpens.toISOString(),
    coveringBegins: currentRound.coveringBegins.toISOString(),
    coversDue: currentRound.coversDue.toISOString(),
    listeningParty: currentRound.listeningParty.toISOString(),
  };

  return (
    <ReflectionDisplay
      roundSlug={currentRound.slug}
      round={serializedRound}
      reflections={reflections}
    />
  );
}
