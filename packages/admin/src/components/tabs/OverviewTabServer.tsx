import { unstable_cache } from 'next/cache';
import { adminProvider } from "@eptss/data-access";
import { OverviewTab } from "../OverviewTab";

import { Text } from "@eptss/ui";
// Cache the stats for 60 seconds
const getCachedStats = unstable_cache(
  async () => adminProvider(),
  ['admin-stats'],
  { revalidate: 60, tags: ['admin-stats'] }
);

export async function OverviewTabServer() {
  try {
    const stats = await getCachedStats();
    return <OverviewTab stats={stats} />;
  } catch (error) {
    console.error('OverviewTabServer: Error fetching stats:', error);
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-lg">
        <h3 className="text-red-500 font-semibold mb-2">Error Loading Overview</h3>
        <Text color="secondary">{error instanceof Error ? error.message : 'Unknown error'}</Text>
      </div>
    );
  }
}
