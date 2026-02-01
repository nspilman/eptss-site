import { Dashboard } from '@eptss/dashboard';
import { eptssDeboardConfig } from '@/app/dashboard/dashboard-config';
import { getAuthUser } from '@eptss/core/utils/supabase/server';
import { getUserById, getProjectIdFromSlug, isValidProjectSlug } from '@eptss/core';
import { notFound, redirect } from 'next/navigation';
import {
  fetchHeroData,
  fetchParticipantsData,
  fetchDiscussionData,
} from '@/app/dashboard/data-fetchers';
import { StickyDiscussionFooterWrapper } from '@/app/dashboard/StickyDiscussionFooterWrapper';
import { ProjectCookieSetter } from './ProjectCookieSetter';

// Force dynamic rendering for authenticated content
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface ProjectDashboardPageProps {
  params: Promise<{ projectSlug: string }>;
}

export default async function ProjectDashboardPage({ params }: ProjectDashboardPageProps) {
  const resolvedParams = await params;
  const { projectSlug: slug } = resolvedParams;

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
  const [heroData, participantsData, userData] =
    await Promise.all([
      fetchHeroData(projectId, slug),
      fetchParticipantsData(projectId),
      getUserById(userId),
    ]);

  // Fetch discussion data if we have a round
  const discussionData = heroData ? await fetchDiscussionData(heroData.roundId) : null;

  return (
    <>
      <ProjectCookieSetter projectSlug={slug} />
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
          participants: participantsData,
          reflections: heroData ? {
            roundId: heroData.roundId,
            projectSlug: slug, // Keep for server component in package
          } : null,
          inviteFriends: heroData ? {
            userId: userId,
            projectSlug: slug,
            roundSlug: heroData.roundSlug,
          } : null,
        }}
      />
      {heroData && discussionData && (
        <StickyDiscussionFooterWrapper
          roundId={heroData.roundId}
          currentUserId={userId}
          initialComments={discussionData.comments}
          roundParticipants={discussionData.roundParticipants}
        />
      )}
    </>
  );
}
