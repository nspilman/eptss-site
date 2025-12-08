import { notFound } from 'next/navigation';
import { getProjectBySlug, isValidProjectSlug } from '@eptss/data-access';
import { ReactNode } from 'react';

interface ProjectLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Validate the project slug
  if (!isValidProjectSlug(slug)) {
    notFound();
  }

  // Fetch project details
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  // The layout provides project context to all child routes
  // Child routes can access params.slug to get the current project
  return <>{children}</>;
}

/**
 * Generate static params for all projects
 */
export async function generateStaticParams() {
  return [
    { slug: 'cover' },
    { slug: 'original' },
    { slug: 'monthly-original' },
  ];
}
