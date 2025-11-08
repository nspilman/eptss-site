import { Suspense } from "react";
import { Metadata } from 'next/types';
import { getCurrentAndPastRounds } from "@eptss/data-access/services/roundService";
import { CreateRoundForm, UpdateRoundForm, SetRoundSongForm } from "@eptss/admin";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Rounds Management | Admin",
  description: "Manage EPTSS rounds",
};

async function RoundsContent() {
  const roundsResult = await getCurrentAndPastRounds();
  const rounds = roundsResult.status === 'success' ? roundsResult.data : [];
  const currentRound = rounds.length > 0 ? rounds[0] : null;

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">Rounds Management</h2>
          <p className="text-secondary">Create, manage, and monitor all EPTSS rounds</p>
        </div>
      </div>

      {/* Round Creation and Management Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Round
          </h3>
          <CreateRoundForm />
        </div>

        <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Update Round</h3>
          <UpdateRoundForm allRoundSlugs={rounds.map(r => r.slug)} />
        </div>

        {currentRound && (
          <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Set Round Song</h3>
            <SetRoundSongForm roundId={currentRound.roundId} roundSlug={currentRound.slug} />
          </div>
        )}
      </div>

      {/* Rounds List */}
      <div className="bg-background-secondary/50 border border-background-tertiary/50 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-primary mb-4">All Rounds</h3>
        <div className="space-y-3">
          {rounds.length === 0 ? (
            <p className="text-secondary text-center py-8">No rounds found</p>
          ) : (
            rounds.map((round) => (
              <Link
                key={round.roundId}
                href={`/admin/rounds/${round.slug}`}
                className="block p-4 bg-background-tertiary/30 hover:bg-background-tertiary/50 border border-background-tertiary/50 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-primary">{round.slug}</h4>
                    <p className="text-sm text-secondary">
                      Signups: {round.signupCount || 0} | Submissions: {round.submissionCount || 0}
                    </p>
                  </div>
                  <div className="text-sm text-secondary">
                    {round.signupCount && round.submissionCount
                      ? `${Math.round((round.submissionCount / round.signupCount) * 100)}% completion`
                      : 'N/A'}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoundsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-12 bg-background-secondary/30 animate-pulse rounded" />
          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-background-secondary/30 animate-pulse rounded" />
            ))}
          </div>
        </div>
      }
    >
      <RoundsContent />
    </Suspense>
  );
}
