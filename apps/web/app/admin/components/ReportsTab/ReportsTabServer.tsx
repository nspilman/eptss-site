import { roundProvider, votesProvider } from "@/providers";
import { ReportsTab } from "../ReportsTab";

type ReportsTabServerProps = {
  roundSlug: string;
};

export async function ReportsTabServer({ roundSlug }: ReportsTabServerProps) {
  if (!roundSlug) {
    return (
      <div className="text-center text-secondary py-8">
        No round selected. Please select a round from the dropdown above.
      </div>
    );
  }

  // Fetch round and votes data in parallel
  const [roundData, votesData] = await Promise.all([
    roundProvider(roundSlug),
    votesProvider({ roundSlug }),
  ]);

  return (
    <ReportsTab
      stats={{ totalUsers: 0, totalRounds: 0, activeUsers: 0, completionRate: 0 }}
      phase={roundData.phase}
      dateLabels={roundData.dateLabels}
      signups={roundData.signups}
      submissions={roundData.submissions}
      voteOptions={roundData.voteOptions}
      outstandingVoters={votesData.outstandingVoters || []}
      voteResults={votesData.voteResults || []}
      allVotes={votesData.allVotes || []}
    />
  );
}
