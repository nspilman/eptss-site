import { Suspense } from "react";
import { Metadata } from 'next/types';
import { getCurrentAndPastRounds, getAllProjects, COVER_PROJECT_ID } from "@eptss/data-access";
import { getProjectBusinessRules } from "@eptss/project-config";
import { RoundsPageClient } from "./RoundsPageClient";

export const metadata: Metadata = {
  title: "Rounds Management | Admin",
  description: "Manage EPTSS rounds",
};

async function RoundsContent({ projectId }: { projectId: string }) {
  // Fetch all projects
  const projects = await getAllProjects();

  // Fetch rounds and config for each project
  const roundsByProject: Record<string, any[]> = {};
  const projectConfigs: Record<string, { requirePrompt: boolean }> = {};

  for (const project of projects) {
    const roundsResult = await getCurrentAndPastRounds(project.id);
    roundsByProject[project.id] = roundsResult.status === 'success' ? roundsResult.data : [];

    // Fetch business rules to check if prompts are required
    const businessRules = await getProjectBusinessRules(project.slug as any);
    projectConfigs[project.id] = {
      requirePrompt: businessRules.requirePrompt
    };
  }

  return (
    <RoundsPageClient
      projects={projects.map(p => ({ id: p.id, name: p.name, slug: p.slug }))}
      initialProjectId={projectId}
      roundsByProject={roundsByProject}
      projectConfigs={projectConfigs}
    />
  );
}

export default async function RoundsPage({
  searchParams
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const projectId = resolvedSearchParams.projectId || COVER_PROJECT_ID;
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
      <RoundsContent projectId={projectId} />
    </Suspense>
  );
}
