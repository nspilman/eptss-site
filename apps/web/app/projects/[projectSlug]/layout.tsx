import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isValidProjectSlug, getProjectIdFromSlug, type ProjectSlug } from '@eptss/core';
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

  // Get project ID from slug
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  return (
    <ProjectProvider projectSlug={projectSlug} projectId={projectId}>
      {children}
    </ProjectProvider>
  );
}

/**
 * Generate static params for all projects
 */
export async function generateStaticParams() {
  return [
    { projectSlug: 'cover' },
    { projectSlug: 'monthly-original' },
  ];
}
