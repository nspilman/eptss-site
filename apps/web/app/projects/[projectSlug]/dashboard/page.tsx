import { Dashboard } from '@eptss/dashboard';
import { eptssDeboardConfig } from '@/app/dashboard/dashboard-config';
import { getAuthUser } from '@eptss/core/utils/supabase/server';
import { loadIdentity } from '@eptss/auth/atproto';
import { getUserById, getProjectIdFromSlug, isValidProjectSlug } from '@eptss/core';
import { notFound, redirect } from 'next/navigation';
import { AtprotoLinkSection } from '@eptss/profile';
import {
  fetchHeroData,
  fetchParticipantsData,
  fetchDiscussionData,
} from '@/app/dashboard/data-fetchers';
import { StickyDiscussionFooterWrapper } from '@/app/dashboard/StickyDiscussionFooterWrapper';
import { RecordMigration } from '@/components/RecordMigration/RecordMigration';
import { getClaimableCovers, getClaimableSignups } from '@/lib/atproto/claims';
import { toMigrationItems, type MigratableItem } from '@/lib/atproto/migration-items';
import { ProjectCookieSetter } from './ProjectCookieSetter';

// Force dynamic rendering for authenticated content
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface ProjectDashboardPageProps {
  params: Promise<{ projectSlug: string }>;
  // Next.js 15: searchParams is a promise. Carries the OAuth callback's status params.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProjectDashboardPage({
  params,
  searchParams,
}: ProjectDashboardPageProps) {
  const [{ projectSlug: slug }, sp] = await Promise.all([params, searchParams]);

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
  const [heroData, participantsData, userData, identity] =
    await Promise.all([
      fetchHeroData(projectId, slug),
      fetchParticipantsData(projectId),
      getUserById(userId),
      loadIdentity(userId),
    ]);

  // Fetch discussion data if we have a round
  const discussionData = heroData ? await fetchDiscussionData(heroData.roundId) : null;

  // The link→migrate workflow lives right here on the dashboard (not a pointer to the
  // profile). Decode the OAuth callback's status params, and — once linked — gather the
  // records EPTSS still holds so the migration modal can bring them home.
  const linkedSuccess = sp.linked === 'success';
  const linkedError = typeof sp.linked_error === 'string' ? sp.linked_error : null;
  const existingDid = typeof sp.existing_did === 'string' ? sp.existing_did : null;
  const dashboardPath = `/projects/${slug}/dashboard`;

  let migrationItems: MigratableItem[] = [];
  if (identity) {
    const [covers, signups] = await Promise.all([
      getClaimableCovers(userId),
      getClaimableSignups(userId, identity.did),
    ]);
    migrationItems = toMigrationItems(covers, signups, identity.did);
  }

  return (
    <>
      <ProjectCookieSetter projectSlug={slug} />
      {/* Linking is the prerequisite for cover submission (covers write to the member's
          own repo). Unlinked members get the link form right here — it returns to this
          dashboard after OAuth — and it disappears once they've linked. */}
      {!identity && (
        <div id="atproto-link" className="mb-6">
          <AtprotoLinkSection
            identity={null}
            linkedSuccess={linkedSuccess}
            linkedError={linkedError}
            existingDid={existingDid}
            returnTo={dashboardPath}
          />
        </div>
      )}
      {/* Post-OAuth (?linked=success) this auto-runs: a full-screen modal that moves the
          member's still-held records into their repo. Renders only when there's work. */}
      {identity && migrationItems.length > 0 && (
        <RecordMigration
          handle={identity.handle}
          autoStart={linkedSuccess}
          items={migrationItems}
        />
      )}
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
