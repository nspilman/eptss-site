import { redirect } from 'next/navigation';
import { getAuthUser } from '@eptss/auth/server';
import { getUserById, getUserParticipationCounts } from '@eptss/data-access';
import { ProfileHeader, ProfileTabs, PersonalInfoTab } from '@eptss/profile';

export default async function ProfilePage() {
  const { userId } = await getAuthUser();

  if (!userId) {
    redirect('/login?redirect=/dashboard/profile');
  }

  const [userData, counts] = await Promise.all([
    getUserById(userId),
    getUserParticipationCounts(userId)
  ]);

  if (!userData) {
    redirect('/login?redirect=/dashboard/profile');
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <ProfileHeader
          user={userData}
          signupCount={counts.signupCount}
          submissionCount={counts.submissionCount}
          voteCount={counts.voteCount}
        />
      </div>

      <ProfileTabs
        signupCount={counts.signupCount}
        submissionCount={counts.submissionCount}
        voteCount={counts.voteCount}
      />

      <PersonalInfoTab user={userData} />
    </div>
  );
}
