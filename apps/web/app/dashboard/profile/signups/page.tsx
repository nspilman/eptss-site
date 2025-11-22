import { redirect } from 'next/navigation';
import { getAuthUser } from '@eptss/auth/server';
import { getUserById, getUserSignups, getUserSubmissions, getUserVotes } from '@eptss/data-access';
import { ProfileHeader, ProfileTabs, SignupsTab } from '@eptss/profile';

export default async function SignupsPage() {
  const { userId } = await getAuthUser();

  if (!userId) {
    redirect('/login?redirect=/dashboard/profile/signups');
  }

  const [userData, signups, submissions, votes] = await Promise.all([
    getUserById(userId),
    getUserSignups(userId),
    getUserSubmissions(userId),
    getUserVotes(userId)
  ]);

  if (!userData) {
    redirect('/login?redirect=/dashboard/profile/signups');
  }

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
      />

      <SignupsTab signups={signups} />
    </div>
  );
}
