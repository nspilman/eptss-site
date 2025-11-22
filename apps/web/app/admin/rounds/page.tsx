import { Suspense } from "react";
import { Metadata } from 'next/types';
import { getCurrentAndPastRounds } from "@eptss/data-access/services/roundService";
import { CreateRoundForm, UpdateRoundForm, SetRoundSongForm } from "@eptss/admin";
import { Card, CardHeader, CardTitle, CardContent } from "@eptss/ui";
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
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Round
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreateRoundForm />
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Update Round</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdateRoundForm allRoundSlugs={rounds.map(r => r.slug)} />
          </CardContent>
        </Card>

        {currentRound && (
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="text-lg">Set Round Song</CardTitle>
            </CardHeader>
            <CardContent>
              <SetRoundSongForm roundId={currentRound.roundId} roundSlug={currentRound.slug} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rounds List */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-xl">All Rounds</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
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
