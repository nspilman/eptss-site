"use server";

import { redirect } from 'next/navigation';
import { getAuthUser } from '@eptss/auth';
import { getUserById, getUserSignups, getUserSubmissions, getUserVotes } from '@eptss/data-access';
import { ProfileHeader, ProfileTabs, OverviewTab } from '@eptss/profile';

export default async function ProfilePage() {
  // Get authenticated user
  const { userId } = await getAuthUser();

  if (!userId) {
    redirect('/login?redirect=/dashboard/profile');
  }

  // Fetch all profile data in parallel
  const [userData, signups, submissions, votes] = await Promise.all([
    getUserById(userId),
    getUserSignups(userId),
    getUserSubmissions(userId),
    getUserVotes(userId)
  ]);

  if (!userData) {
    redirect('/login?redirect=/dashboard/profile');
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Profile Header with Stats */}
      <div className="mb-6">
        <ProfileHeader
          user={userData}
          signupCount={signups.length}
          submissionCount={submissions.length}
          voteCount={votes.length}
        />
      </div>

      {/* Tabs Navigation */}
      <ProfileTabs
        signupCount={signups.length}
        submissionCount={submissions.length}
        voteCount={votes.length}
      />

      {/* Overview Tab Content */}
      <OverviewTab
        signups={signups}
        submissions={submissions}
        votes={votes}
      />
    </div>
  );
}
