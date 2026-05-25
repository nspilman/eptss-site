import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isValidProjectSlug, getProjectIdFromSlug, getProjectBySlug, getAllProjects, type ProjectSlug } from '@eptss/core';
import { ProjectProvider } from './ProjectContext';

interface ProjectLayoutProps {
  children: ReactNode;
  params: Promise<{ projectSlug: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const resolvedParams = await params;
  const { projectSlug } = resolvedParams;

  // Validate project slug
  if (!isValidProjectSlug(projectSlug)) {
    notFound();
  }

  // 404 archived projects so every nested route under /projects/[slug]/...
  // is hidden in one place.
  const project = await getProjectBySlug(projectSlug);
  if (project?.archivedAt) {
    notFound();
  }

  // Get project ID from slug
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  return (
    <ProjectProvider projectSlug={projectSlug} projectId={projectId}>
      {children}
    </ProjectProvider>
  );
}

/**
 * Generate static params for all non-archived projects
 */
export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({ projectSlug: project.slug }));
}
