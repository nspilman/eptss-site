import { unstable_cache } from 'next/cache';
import { getActiveUsers } from "@eptss/core";
import { UsersTab } from "../AdminTabs/UsersTab";

import { Text } from "@eptss/ui";
// Cache active users for 60 seconds
const getCachedActiveUsers = unstable_cache(
  async () => getActiveUsers(),
  ['active-users'],
  { revalidate: 60, tags: ['active-users'] }
);

export async function UsersTabServer() {
  try {
    const activeUsers = await getCachedActiveUsers();
    return <UsersTab activeUsers={activeUsers} />;
  } catch (error) {
    console.error('UsersTabServer: Error fetching users:', error);
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/50 rounded-lg">
        <h3 className="text-red-500 font-semibold mb-2">Error Loading Users</h3>
        <Text color="secondary">{error instanceof Error ? error.message : 'Unknown error'}</Text>
      </div>
    );
  }
}
