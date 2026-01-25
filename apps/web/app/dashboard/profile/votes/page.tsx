import { redirect } from 'next/navigation';
import { getAuthUser } from '@eptss/auth/server';
import { getUserById, getUserSignups, getUserSubmissions, getUserVotes } from '@eptss/core';
import { ProfileHeader, ProfileTabs, VotesTab } from '@eptss/profile';

export default async function VotesPage() {
  const { userId } = await getAuthUser();

  if (!userId) {
    redirect('/login?redirect=/dashboard/profile/votes');
  }

  const [userData, signups, submissions, votes] = await Promise.all([
    getUserById(userId),
    getUserSignups(userId),
    getUserSubmissions(userId),
    getUserVotes(userId)
  ]);

  if (!userData) {
    redirect('/login?redirect=/dashboard/profile/votes');
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

      <VotesTab votes={votes} />
    </div>
  );
}
