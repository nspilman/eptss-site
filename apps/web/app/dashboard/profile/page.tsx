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
import { ClaimButton } from './ClaimButton';
import { ClaimAllButton } from './ClaimAllButton';
import { PlyrRehomeButton } from './PlyrRehomeButton';

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
            covers={covers}
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
