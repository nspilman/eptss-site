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
  params: Promise<{ slug: string }>;
}

export default async function ProjectDashboardPage({ params }: ProjectDashboardPageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Validate project slug
  if (!isValidProjectSlug(slug)) {
    notFound();
  }

  const projectId = getProjectIdFromSlug(slug);

  // Require authentication for dashboard
  const { userId } = await getAuthUser();
  if (!userId) {
    redirect(`/login?redirect=/project/${slug}/dashboard`);
  }

  // Fetch data for all panels in parallel
  const [heroData, actionData, participantsData, userData] =
    await Promise.all([
      fetchHeroData(projectId),
      fetchActionData(projectId, slug),
      fetchParticipantsData(projectId),
      getUserById(userId),
    ]);

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
        countdown: actionData ? {
          phase: actionData.phase,
          timeRemaining: actionData.timeRemaining,
          dueDate: actionData.dueDate,
          urgencyLevel: actionData.urgencyLevel,
          hasSignedUp: actionData.hasSignedUp,
          hasVoted: actionData.hasVoted,
          hasSubmitted: actionData.hasSubmitted,
        } : null,
        discussions: heroData ? {
          roundSlug: heroData.roundSlug,
          currentUserId: userId,
        } : null,
        action: actionData,
        participants: participantsData,
        reflections: heroData ? {
          roundId: heroData.roundId,
        } : null,
        inviteFriends: {
          userId: userId,
        },
      }}
    />
  );
}
