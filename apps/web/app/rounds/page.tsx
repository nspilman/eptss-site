import { ClientRoundsDisplay } from "@/app/index/Homepage/RoundsDisplay/ClientRoundsDisplay";

// Enable static generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

async function getRoundsData() {
  try {
    // Fetch current round to determine phase
    const currentRoundResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/round/current`,
      { next: { revalidate: 3600 } }
    );
    const currentRoundData = await currentRoundResponse.json();
    
    // Fetch rounds data
    const excludeCurrentRound = currentRoundData?.phase === 'signups';
    const roundsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/rounds?excludeCurrentRound=${excludeCurrentRound}`,
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

export default async function RoundsPage() {
  const { rounds, currentRoundId, isVotingPhase } = await getRoundsData();

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
