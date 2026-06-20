import { Suspense } from "react";
import { Metadata } from 'next/types';
import { getActiveUsers, getUserDetails, getMigrationStatus } from "@eptss/admin";
import { ActiveUsersCard, UserStatsComponent, BlueskyMigrationCard } from "@eptss/admin";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@eptss/ui";

export const metadata: Metadata = {
  title: "Users Management | Admin",
  description: "Manage EPTSS users",
};

async function UsersContent() {
  const [activeUsers, userDetails, migrationStatus] = await Promise.all([
    getActiveUsers(),
    getUserDetails(),
    getMigrationStatus(),
  ]);

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2">Users Management</h2>
        <p className="text-secondary">Monitor user activity and engagement</p>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-xl">Bluesky Migration</CardTitle>
          <CardDescription>
            Track which members have linked an Atmosphere identity and whether their covers
            have migrated to that DID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BlueskyMigrationCard data={migrationStatus} />
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-xl">Active Users</CardTitle>
          <CardDescription>
            Users who have participated in recent rounds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActiveUsersCard users={activeUsers} />
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-xl">Detailed User Statistics</CardTitle>
          <CardDescription>
            Comprehensive breakdown of user participation and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserStatsComponent
            detailData={userDetails}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="h-96 bg-background-secondary/30 animate-pulse rounded" />}>
      <UsersContent />
    </Suspense>
  );
}
