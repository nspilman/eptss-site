import { unstable_cache } from 'next/cache';
import { getAllUsers as getAllUsersService } from "@/data-access";
import { roundsProvider, roundProvider } from "@/providers";
import { ActionsTab } from "../ActionsTab";

type ActionsTabServerProps = {
  roundSlug: string;
};

// Cache actions data for 60 seconds
const getCachedActionsData = (roundSlug: string) =>
  unstable_cache(
    async () => {
      const [allUsers, roundsData] = await Promise.all([
        getAllUsersService(),
        roundsProvider({}),
      ]);

      const { allRoundSlugs } = roundsData;

      let roundId = 0;
      if (roundSlug) {
        const roundData = await roundProvider(roundSlug);
        roundId = roundData.roundId;
      }

      return { allUsers, allRoundSlugs, roundId };
    },
    [`actions-${roundSlug}`],
    { revalidate: 60, tags: [`actions-${roundSlug}`] }
  );

export async function ActionsTabServer({ roundSlug }: ActionsTabServerProps) {
  try {
    const { allUsers, allRoundSlugs, roundId } = await getCachedActionsData(roundSlug)();

    return (
      <ActionsTab
        roundId={roundId}
        roundSlug={roundSlug}
        users={allUsers}
        allRoundSlugs={allRoundSlugs}
      />
    );
  } catch (error) {
    console.error('ActionsTabServer: Error fetching actions data:', error);
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-lg">
        <h3 className="text-red-500 font-semibold mb-2">Error Loading Actions</h3>
        <p className="text-secondary">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}
