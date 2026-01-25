import { getAuthUser } from '@eptss/core/utils/supabase/server';
import { getUserProjects } from '@eptss/core';
import { redirect } from 'next/navigation';
import { ProjectDashboardPicker } from './ProjectDashboardPicker';
import { cookies } from 'next/headers';

import { Text } from "@eptss/ui";
// Force dynamic rendering for authenticated content
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DashboardPage() {
  // Get authenticated user
  const { userId } = await getAuthUser();

  if (!userId) {
    // Not logged in - redirect to home or login
    redirect('/');
  }

  // Get user's project memberships
  const userProjects = await getUserProjects(userId);

  if (userProjects.length === 0) {
    // No projects - show message or redirect to home
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-2xl font-bold mb-4">No Projects Yet</h1>
        <Text color="secondary" className="mb-6">
          You haven't participated in any projects yet. Sign up for a round to get started!
        </Text>
        <a
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Browse Projects
        </a>
      </div>
    );
  }

  if (userProjects.length === 1) {
    // Single project: redirect to that project's dashboard
    const projectSlug = userProjects[0].slug;
    redirect(`/projects/${projectSlug}/dashboard`);
  }

  // Multiple projects: check for last viewed project
  const cookieStore = await cookies();
  const lastViewedSlug = cookieStore.get('lastViewedProject')?.value;

  // If we have a last viewed project and it's in the user's project list, redirect there
  if (lastViewedSlug && userProjects.some(p => p.slug === lastViewedSlug)) {
    redirect(`/projects/${lastViewedSlug}/dashboard`);
  }

  // No last viewed project or it's not valid: show project picker
  return <ProjectDashboardPicker projects={userProjects} />;
}
