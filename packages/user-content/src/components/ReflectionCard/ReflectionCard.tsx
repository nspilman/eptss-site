import { getUserReflectionsForRound, roundProvider, COVER_PROJECT_ID, getProjectSlugFromId } from "@eptss/core";
import { getAuthUser } from "@eptss/core/utils/supabase/server";
import { ReflectionDisplay } from "./ReflectionDisplay";

interface ReflectionCardProps {
  projectId?: string;
  projectSlug?: string;
}

export async function ReflectionCard({ projectId = COVER_PROJECT_ID, projectSlug }: ReflectionCardProps = {}) {
  const [
    currentRound,
    { userId }
  ] = await Promise.all([
    roundProvider({ projectId }),
    getAuthUser()
  ]);

  // Don't show if no current round
  if (!currentRound || !currentRound.roundId) {
    return null;
  }

  // Determine projectSlug if not provided
  const resolvedProjectSlug: string = projectSlug || getProjectSlugFromId(projectId) || 'cover';

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
      projectSlug={resolvedProjectSlug}
      round={serializedRound}
      reflections={reflections}
    />
  );
}
