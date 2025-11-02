"use server";

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthUser } from '@/utils/supabase/server';
import { ProfileHeader, ProfileTabs, PersonalInfoTab } from '@eptss/profile';

async function checkAuthentication() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirect=/dashboard/profile/personal');
  }

  return { supabase, userId: (await getAuthUser()).userId };
}

async function fetchUserDetails(supabase: any, userId: string) {
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('userid', userId)
    .single();

  if (userError) {
    console.error('Error fetching user data:', userError);
  }

  return userData;
}

async function fetchCounts(supabase: any, userId: string) {
  const [signupsResult, submissionsResult, votesResult] = await Promise.all([
    supabase.from('sign_ups').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('submissions').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('song_selection_votes').select('round_id').eq('user_id', userId)
  ]);

  const signupCount = signupsResult.count || 0;
  const submissionCount = submissionsResult.count || 0;
  const voteCount = votesResult.data ? new Set(votesResult.data.map(v => v.round_id)).size : 0;

  return { signupCount, submissionCount, voteCount };
}

export default async function PersonalInfoPage() {
  const { supabase, userId } = await checkAuthentication();

  const [userData, counts] = await Promise.all([
    fetchUserDetails(supabase, userId),
    fetchCounts(supabase, userId)
  ]);

  if (!userData) {
    redirect('/login?redirect=/dashboard/profile/personal');
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
