"use client";

import { useState } from "react";
import { CreateRoundForm, UpdateRoundForm, SetRoundSongForm, ProjectSelector, type Project } from "@eptss/admin";
import { Card, CardHeader, CardTitle, CardContent } from "@eptss/ui";
import { routes } from "@eptss/routing";
import Link from "next/link";
import { Plus } from "lucide-react";

type Round = {
  roundId: number;
  slug: string;
  signupCount?: number;
  submissionCount?: number;
};

type RoundsPageClientProps = {
  projects: Project[];
  initialProjectId: string;
  roundsByProject: Record<string, Round[]>;
  projectConfigs: Record<string, { requirePrompt: boolean }>;
};

export function RoundsPageClient({ projects, initialProjectId, roundsByProject, projectConfigs }: RoundsPageClientProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const rounds = roundsByProject[selectedProjectId] || [];
  const currentRound = rounds.length > 0 ? rounds[0] : null;
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectSlug = selectedProject?.slug;
  const requirePrompt = projectConfigs[selectedProjectId]?.requirePrompt || false;

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">Rounds Management</h2>
          <p className="text-secondary">Create, manage, and monitor all EPTSS rounds</p>
        </div>
      </div>

      {/* Project Selector */}
      <Card variant="glass">
        <CardContent className="pt-6">
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={setSelectedProjectId}
            label="Project"
          />
        </CardContent>
      </Card>

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
            <CreateRoundForm projectId={selectedProjectId} projectSlug={projectSlug} />
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Update Round</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdateRoundForm
              projectId={selectedProjectId}
              projectSlug={projectSlug}
              allRoundSlugs={rounds.map(r => r.slug)}
              requirePrompt={requirePrompt}
            />
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
                  href={routes.admin.rounds.detail(round.slug, { query: { projectId: selectedProjectId } })}
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
