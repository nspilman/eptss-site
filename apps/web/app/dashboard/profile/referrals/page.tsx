import { redirect } from 'next/navigation';
import { getAuthUser } from '@eptss/auth/server';
import { getUserById, getUserSignups, getUserSubmissions, getUserVotes } from '@eptss/data-access';
import { getUserReferralCodes, getUserReferrals, getReferralStats } from '@eptss/data-access/services/referralService';
import { ProfileHeader, ProfileTabs, ReferralsTab } from '@eptss/profile';

export default async function ReferralsPage() {
  const { userId } = await getAuthUser();

  if (!userId) {
    redirect('/login?redirect=/dashboard/profile/referrals');
  }

  const [userData, signups, submissions, votes, referralCodes, referrals] = await Promise.all([
    getUserById(userId),
    getUserSignups(userId),
    getUserSubmissions(userId),
    getUserVotes(userId),
    getUserReferralCodes(userId),
    getUserReferrals(userId)
  ]);

  if (!userData) {
    redirect('/login?redirect=/dashboard/profile/referrals');
  }

  const referralCount = referrals.success ? referrals.referrals.length : 0;

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <ProfileHeader
          user={userData}
          signupCount={signups.length}
          submissionCount={submissions.length}
          voteCount={votes.length}
        />
      </div>

      <ProfileTabs
        signupCount={signups.length}
        submissionCount={submissions.length}
        voteCount={votes.length}
        referralCount={referralCount}
      />

      <ReferralsTab
        initialCodes={referralCodes.success ? referralCodes.codes : []}
        initialReferrals={referrals.success ? referrals.referrals : []}
      />
    </div>
  );
}
