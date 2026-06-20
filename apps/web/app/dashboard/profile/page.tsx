import { redirect } from 'next/navigation';
import { getAuthUser } from '@eptss/auth/server';
import { loadIdentity } from '@eptss/auth/atproto';
import { getUserById, getUserParticipationCounts } from '@eptss/core';
import {
  ProfileHeader,
  ProfileTabs,
  PersonalInfoTab,
  AtprotoLinkSection,
  MyCoversSection,
} from '@eptss/profile';
import { getClaimableCovers } from '@/lib/atproto/claims';
import { plyrOwnership } from '@/lib/atproto/plyr-rehome';
import { resolvePlyrTrackIds, plyrTrackPageUrl } from '@eptss/atproto';
import { ClaimButton } from './ClaimButton';
import { ClaimAllButton } from './ClaimAllButton';
import { PlyrRehomeButton } from './PlyrRehomeButton';

/**
 * Resolve each cover's plyr.fm listen URL (the canonical track page), for covers
 * re-hosted to plyr. The cover already carries its `fm.plyr.track` AT URI; we ask
 * plyr's API for the numeric track id behind it (grouped by repo DID) and build the
 * page URL. Best-effort — covers without a plyr track, or any resolution failure,
 * fall back to their original deliverable link.
 */
async function resolvePlyrListenUrls(
  covers: { submissionId: number; plyrTrackUri: string | null }[],
): Promise<Map<number, string>> {
  const withPlyr = covers.filter((c) => c.plyrTrackUri);
  if (withPlyr.length === 0) return new Map();

  const idByUri = await resolvePlyrTrackIds(
    withPlyr.map((c) => c.plyrTrackUri!),
  );

  const out = new Map<number, string>();
  for (const c of withPlyr) {
    const id = idByUri.get(c.plyrTrackUri!);
    if (id != null) out.set(c.submissionId, plyrTrackPageUrl(id));
  }
  return out;
}

export default async function ProfilePage({
  searchParams,
}: {
  // Next.js 15: searchParams is a promise.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { userId } = await getAuthUser();

  if (!userId) {
    redirect('/login?redirect=/dashboard/profile');
  }

  const [userData, counts, identity, sp] = await Promise.all([
    getUserById(userId),
    getUserParticipationCounts(userId),
    loadIdentity(userId),
    searchParams,
  ]);

  if (!userData) {
    redirect('/login?redirect=/dashboard/profile');
  }

  // Phase A of the claim flow: a linked user can preview the covers EPTSS holds
  // on their behalf. Only fetched when linked — there's nothing to claim to
  // otherwise, and unlinked users shouldn't pay for the query.
  const covers = identity ? await getClaimableCovers(userId) : [];
  const unclaimedCount = covers.filter((c) => c.claimedAtUri == null).length;

  // Point each cover's "listen" link at its plyr track page when it has one, so it
  // resolves to the plyr record rather than the raw Supabase/SoundCloud source.
  const plyrListenUrls = await resolvePlyrListenUrls(covers);
  const coversView = covers.map((c) => ({
    ...c,
    plyrListenUrl: plyrListenUrls.get(c.submissionId) ?? null,
  }));

  // Decode atproto link status from the callback redirect params.
  const linkedSuccess = sp.linked === 'success';
  const linkedError = typeof sp.linked_error === 'string' ? sp.linked_error : null;
  const existingDid = typeof sp.existing_did === 'string' ? sp.existing_did : null;

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <ProfileHeader
          user={userData}
          signupCount={counts.signupCount}
          submissionCount={counts.submissionCount}
          voteCount={counts.voteCount}
          atprotoHandle={identity?.handle ?? null}
        />
      </div>

      <ProfileTabs
        signupCount={counts.signupCount}
        submissionCount={counts.submissionCount}
        voteCount={counts.voteCount}
      />

      <div className="space-y-6 mt-6">
        <PersonalInfoTab user={userData} />
        <div id="atproto-link">
          <AtprotoLinkSection
            identity={identity ? { did: identity.did, handle: identity.handle } : null}
            linkedSuccess={linkedSuccess}
            linkedError={linkedError}
            existingDid={existingDid}
          />
        </div>
        {identity && (
          <MyCoversSection
            covers={coversView}
            handle={identity.handle}
            headerAction={
              unclaimedCount >= 1 ? (
                <ClaimAllButton count={unclaimedCount} />
              ) : undefined
            }
            renderClaimAction={(cover) => (
              <ClaimButton
                submissionId={cover.submissionId}
                claimed={cover.claimedAtUri != null}
              />
            )}
            renderPlyrAction={(cover) => {
              const st = plyrOwnership(cover.plyrTrackUri ?? null, identity.did);
              return st === 'none' ? null : (
                <PlyrRehomeButton submissionId={cover.submissionId} state={st} />
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
