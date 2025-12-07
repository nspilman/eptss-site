import { unstable_cache } from 'next/cache';
import { roundProvider, votesProvider, COVER_PROJECT_ID } from "@eptss/data-access";
import { adminProvider } from "@eptss/data-access";
import { ReportsTab } from "../ReportsTab";

type ReportsTabServerProps = {
  roundSlug: string;
};

// Cache round data for 60 seconds per round
const getCachedRoundData = (roundSlug: string) =>
  unstable_cache(
    async () => {
      // TODO: Support multi-project - currently hardcoded to Cover Project
      const [stats, roundData, votesData] = await Promise.all([
        adminProvider(),
        roundProvider({ slug: roundSlug, projectId: COVER_PROJECT_ID }),
        votesProvider({ projectId: COVER_PROJECT_ID, roundSlug }),
      ]);
      return { stats, roundData, votesData };
    },
    [`round-data-${roundSlug}`],
    { revalidate: 60, tags: [`round-${roundSlug}`] }
  );

export async function ReportsTabServer({ roundSlug }: ReportsTabServerProps) {
  if (!roundSlug) {
    return (
      <div className="text-center text-secondary py-8">
        No round selected. Please select a round from the dropdown above.
      </div>
    );
  }

  try {
    const { stats, roundData, votesData } = await getCachedRoundData(roundSlug)();

    return (
      <ReportsTab
        stats={stats}
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
  } catch (error) {
    console.error('ReportsTabServer: Error fetching round data:', error);
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-lg">
        <h3 className="text-red-500 font-semibold mb-2">Error Loading Reports</h3>
        <p className="text-secondary">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}
