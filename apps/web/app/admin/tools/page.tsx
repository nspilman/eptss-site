import { Suspense } from "react";
import { Metadata } from 'next/types';
import { getAllUsers, getAllProjects, COVER_PROJECT_ID } from "@eptss/core";
import { getCurrentAndPastRounds } from "@eptss/rounds/services";
import { ToolsPageClient } from "./ToolsPageClient";

export const metadata: Metadata = {
  title: "Admin Tools | Admin",
  description: "Admin utilities and tools",
};

async function ToolsContent({ projectId }: { projectId: string }) {
  // Fetch all projects
  const projects = await getAllProjects();

  // Fetch rounds for each project
  const roundsByProject: Record<string, any[]> = {};

  for (const project of projects) {
    const roundsResult = await getCurrentAndPastRounds(project.id);
    roundsByProject[project.id] = roundsResult.status === 'success' ? roundsResult.data : [];
  }

  // Fetch all users
  const allUsers = await getAllUsers();

  return (
    <ToolsPageClient
      projects={projects.map(p => ({ id: p.id, name: p.name, slug: p.slug }))}
      initialProjectId={projectId}
      roundsByProject={roundsByProject}
      allUsers={allUsers}
    />
  );
}

export default async function ToolsPage({
  searchParams
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const projectId = resolvedSearchParams.projectId || COVER_PROJECT_ID;

  return (
    <Suspense fallback={<div className="h-96 bg-background-secondary/30 animate-pulse rounded" />}>
      <ToolsContent projectId={projectId} />
    </Suspense>
  );
}
