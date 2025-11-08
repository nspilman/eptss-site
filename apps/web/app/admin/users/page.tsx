import { Suspense } from "react";
import { Metadata } from 'next/types';
import { getActiveUsers, getUserDetails } from "@eptss/admin";
import { ActiveUsersCard, UserStatsComponent } from "@eptss/admin";

export const metadata: Metadata = {
  title: "Users Management | Admin",
  description: "Manage EPTSS users",
};

async function UsersContent() {
  const [activeUsers, userDetails] = await Promise.all([
    getActiveUsers(),
    getUserDetails(),
  ]);

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2">Users Management</h2>
        <p className="text-secondary">Monitor user activity and engagement</p>
      </div>

      <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Active Users</h3>
        <p className="text-sm text-secondary mb-4">
          Users who have participated in recent rounds
        </p>
        <ActiveUsersCard users={activeUsers} />
      </div>

      <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Detailed User Statistics</h3>
        <p className="text-sm text-secondary mb-4">
          Comprehensive breakdown of user participation and activity
        </p>
        <UserStatsComponent 
          detailData={userDetails}
        />
      </div>
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
