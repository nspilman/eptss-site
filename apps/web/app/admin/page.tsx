import { Suspense } from "react";
import { Metadata } from 'next/types';
import { adminProvider } from "@eptss/admin";
import { ProjectStatsCard } from "@eptss/admin";
import { getCurrentRound } from "@eptss/data-access";
import { getCurrentPhase } from "@eptss/data-access/services/dateService";
import { Button } from "@eptss/ui";

export const metadata: Metadata = {
  title: "Dashboard | Admin | Everyone Plays the Same Song",
  description: "Administrative dashboard overview",
};

async function DashboardContent() {
  const stats = await adminProvider();
  const currentRoundResult = await getCurrentRound();
  const currentRound = currentRoundResult.status === 'success' ? currentRoundResult.data : null;
  const currentPhase = currentRound ? getCurrentPhase({
    signupOpens: currentRound.signupOpens,
    votingOpens: currentRound.votingOpens,
    coveringBegins: currentRound.coveringBegins,
    coversDue: currentRound.coversDue,
    listeningParty: currentRound.listeningParty,
  }) : null;

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-primary mb-2">Dashboard</h2>
        <p className="text-secondary">Welcome back! Here's what's happening with EPTSS.</p>
      </div>

      {/* Current Round Info */}
      {currentRound && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary mb-1">Current Round</p>
              <h3 className="text-2xl font-bold text-primary">{currentRound.slug}</h3>
              {currentPhase && (
                <p className="text-sm text-secondary mt-2">
                  Phase: <span className="text-primary font-medium">{currentPhase}</span>
                </p>
              )}
            </div>
            <a
              href={`/admin/rounds/${currentRound.slug}`}>
            <Button className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors font-medium">
              View Details
            </Button>
            </a>
          </div>
        </div>
      )}

      {/* Detailed Stats */}
      <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Detailed Statistics</h3>
        <ProjectStatsCard
          totalUsers={stats.totalUsers}
          totalRounds={stats.totalRounds}
          activeUsers={stats.activeUsers}
          completionRate={stats.completionRate}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/rounds"
            className="p-4 bg-background-tertiary/30 hover:bg-background-tertiary/50 border border-background-tertiary/50 rounded-lg transition-colors"
          >
            <h4 className="font-semibold text-primary mb-1">Manage Rounds</h4>
            <p className="text-sm text-secondary">Create and edit rounds</p>
          </a>
          <a
            href="/admin/users"
            className="p-4 bg-background-tertiary/30 hover:bg-background-tertiary/50 border border-background-tertiary/50 rounded-lg transition-colors"
          >
            <h4 className="font-semibold text-primary mb-1">View Users</h4>
            <p className="text-sm text-secondary">See user activity</p>
          </a>
          <a
            href="/admin/tools"
            className="p-4 bg-background-tertiary/30 hover:bg-background-tertiary/50 border border-background-tertiary/50 rounded-lg transition-colors"
          >
            <h4 className="font-semibold text-primary mb-1">Admin Tools</h4>
            <p className="text-sm text-secondary">Manual operations</p>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-12 bg-background-secondary/30 animate-pulse rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-background-secondary/30 animate-pulse rounded" />
            ))}
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
