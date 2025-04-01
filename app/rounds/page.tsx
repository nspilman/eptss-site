"use server";

import { RoundTimeline } from "@/components/rounds/RoundTimeline";
import { getCurrentAndPastRounds, Round } from "@/data-access/roundService";
import { RoundInfo } from "@/types/round";

export default async function RoundsPage() {
  const roundsResult = await getCurrentAndPastRounds();
  const rounds = roundsResult.status === 'success' ? roundsResult.data : [];

  const roundsForTimeline: RoundInfo[] = [...rounds]
    .sort((a, b) => b.roundId - a.roundId)
    .map((round: Round) => {

      
      return {
        roundId: round.roundId,
        slug: round.slug,
        phase: "celebration",
        song: round.song,
        dateLabels: {
          signups: { opens: "", closes: "" },
          voting: { opens: "", closes: "" },
          covering: { opens: "", closes: "" },
          celebration: { opens: "", closes: "" }
        },
        hasRoundStarted: true,
        areSubmissionsOpen: false,
        isVotingOpen: false,
        voteOptions: [],
        submissions: [],
        signups: [],
        playlistUrl: round.playlistUrl,
        // Add the counts to the RoundInfo object
        signupCount: round.signupCount,
        submissionCount: round.submissionCount
      };
    });
  
  if (!roundsForTimeline.length) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-white">All Rounds</h1>
        <div className="text-center py-12">
          <p className="text-lg text-purple-200">Loading rounds...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold bg-linear-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
          All Rounds
        </h1>
        <p className="text-purple-200">{roundsForTimeline.length} rounds total</p>
      </div>
      <RoundTimeline rounds={roundsForTimeline} />
    </main>
  );
}
