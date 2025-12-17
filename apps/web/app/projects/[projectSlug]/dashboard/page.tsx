import { Dashboard } from '@eptss/dashboard';
import { eptssDeboardConfig } from '@/app/dashboard/dashboard-config';
import { getAuthUser } from '@eptss/data-access/utils/supabase/server';
import { getUserById, getProjectIdFromSlug, isValidProjectSlug } from '@eptss/data-access';
import { notFound, redirect } from 'next/navigation';
import {
  fetchHeroData,
  fetchActionData,
  fetchParticipantsData,
} from '@/app/dashboard/data-fetchers';

// Force dynamic rendering for authenticated content
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface ProjectDashboardPageProps {
  params: Promise<{ projectSlug: string }>;
}

export default async function ProjectDashboardPage({ params }: ProjectDashboardPageProps) {
  const resolvedParams = await params;
  const { projectSlug: slug } = resolvedParams;

  console.log('[ProjectDashboardPage] Loading dashboard for projectSlug:', slug);

  // Validate project slug
  if (!isValidProjectSlug(slug)) {
    console.log('[ProjectDashboardPage] Invalid project slug:', slug);
    notFound();
  }

  const projectId = getProjectIdFromSlug(slug);
  console.log('[ProjectDashboardPage] Project ID:', projectId);

  // Require authentication for dashboard
  const { userId } = await getAuthUser();
  if (!userId) {
    redirect(`/login?redirect=/project/${slug}/dashboard`);
  }

  console.log('[ProjectDashboardPage] User ID:', userId);

  // Fetch data for all panels in parallel
  console.log('[ProjectDashboardPage] Fetching panel data...');
  const [heroData, actionData, participantsData, userData] =
    await Promise.all([
      fetchHeroData(projectId, slug),
      fetchActionData(projectId, slug),
      fetchParticipantsData(projectId),
      getUserById(userId),
    ]);

  console.log('[ProjectDashboardPage] heroData:', JSON.stringify(heroData, null, 2));
  console.log('[ProjectDashboardPage] actionData phase:', actionData?.phase, 'phaseName:', actionData?.phaseName);

  const countdownData = actionData ? {
    phase: actionData.phase,
    timeRemaining: actionData.timeRemaining,
    dueDate: actionData.dueDate,
    urgencyLevel: actionData.urgencyLevel,
    hasSignedUp: actionData.hasSignedUp,
    hasVoted: actionData.hasVoted,
    hasSubmitted: actionData.hasSubmitted,
    terminology: heroData?.terminology,
  } : null;

  console.log('[ProjectDashboardPage] countdown panel data:', JSON.stringify(countdownData, null, 2));
  console.log('[ProjectDashboardPage] countdown terminology:', JSON.stringify(countdownData?.terminology, null, 2));

  return (
    <Dashboard
      config={eptssDeboardConfig}
      user={{ id: userId, role: 'user' }}
      panelData={{
        profileSetup: userData ? {
          userId: userData.userid,
          username: userData.username,
          publicDisplayName: userData.publicDisplayName,
          profilePictureUrl: userData.profilePictureUrl,
        } : null,
        hero: heroData,
        countdown: countdownData,
        discussions: heroData ? {
          roundSlug: heroData.roundSlug,
          currentUserId: userId,
        } : null,
        action: actionData,
        participants: participantsData,
        reflections: heroData ? {
          roundId: heroData.roundId,
          projectSlug: slug, // Keep for server component in package
        } : null,
        inviteFriends: {
          userId: userId,
        },
      }}
    />
  );
}
