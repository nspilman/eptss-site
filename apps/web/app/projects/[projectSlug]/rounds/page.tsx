import { ClientRoundsDisplay } from "@/app/index/Homepage/RoundsDisplay/ClientRoundsDisplay";
import { getProjectIdFromSlug, type ProjectSlug } from "@eptss/data-access";

// Enable static generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

interface Props {
  params: Promise<{ projectSlug: string }>;
}

async function getRoundsData(projectId: string) {
  try {
    // Fetch current round to determine phase for this specific project
    const currentRoundResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/round/current?projectId=${projectId}`,
      { next: { revalidate: 3600 } }
    );
    const currentRoundData = await currentRoundResponse.json();

    // Fetch rounds data for this specific project
    const excludeCurrentRound = currentRoundData?.phase === 'signups';
    const roundsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/rounds?projectId=${projectId}&excludeCurrentRound=${excludeCurrentRound}`,
      { next: { revalidate: 3600 } }
    );
    const roundsData = await roundsResponse.json();

    return {
      rounds: roundsData.roundContent || [],
      currentRoundId: currentRoundData?.roundId || null,
      isVotingPhase: currentRoundData?.phase === 'voting',
    };
  } catch (error) {
    console.error("Error fetching rounds data:", error);
    return {
      rounds: [],
      currentRoundId: null,
      isVotingPhase: false,
    };
  }
}

export default async function RoundsPage({ params }: Props) {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  const { rounds, currentRoundId, isVotingPhase } = await getRoundsData(projectId);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <section id="rounds">
          <ClientRoundsDisplay
            rounds={rounds}
            currentRoundId={currentRoundId}
            isVotingPhase={isVotingPhase}
          />
        </section>
      </div>
    </main>
  );
}
