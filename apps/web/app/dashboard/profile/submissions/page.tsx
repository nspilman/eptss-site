"use server";

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthUser } from '@/utils/supabase/server';
import type { Submission, RoundMetadataSubset } from '@eptss/profile/types';
import { ProfileHeader, ProfileTabs, SubmissionsTab } from '@eptss/profile';

async function checkAuthentication() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirect=/dashboard/profile/submissions');
  }

  return { supabase, userId: (await getAuthUser()).userId };
}

async function fetchUserDetails(supabase: any, userId: string) {
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('userid', userId)
    .single();

  return userData;
}

async function fetchUserSubmissions(supabase: any, userId: string) {
  const { data: rawSubmissions } = await supabase
    .from('submissions')
    .select(`
      id,
      created_at,
      soundcloud_url,
      round_id,
      user_id,
      additional_comments,
      round_metadata:round_metadata!submissions_round_id_fkey (
        id,
        slug,
        signup_opens,
        covering_begins,
        covers_due,
        songs:songs!round_metadata_song_id_fkey (title, artist)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!rawSubmissions) return [];

  return rawSubmissions.map((submission: any) => {
    const roundMetadata = submission.round_metadata
      ? {
          id: submission.round_metadata.id,
          slug: submission.round_metadata.slug,
          signup_opens: submission.round_metadata.signup_opens,
          covering_begins: submission.round_metadata.covering_begins,
          covers_due: submission.round_metadata.covers_due
        }
      : null;

    const songInfo = submission.round_metadata?.songs
      ? {
          title: submission.round_metadata.songs.title || 'Unknown Title',
          artist: submission.round_metadata.songs.artist || 'Unknown Artist'
        }
      : { title: 'Unknown Title', artist: 'Unknown Artist' };

    return {
      id: submission.id,
      created_at: submission.created_at,
      title: songInfo.title,
      artist: songInfo.artist,
      soundcloud_url: submission.soundcloud_url,
      round_slug: roundMetadata?.slug || null,
      user_id: submission.user_id,
      additional_comments: submission.additional_comments,
      round_metadata: roundMetadata
    };
  });
}

async function fetchCounts(supabase: any, userId: string) {
  const [signupsResult, votesResult] = await Promise.all([
    supabase.from('sign_ups').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('song_selection_votes').select('round_id').eq('user_id', userId)
  ]);

  const signupCount = signupsResult.count || 0;
  const voteCount = votesResult.data ? new Set(votesResult.data.map(v => v.round_id)).size : 0;

  return { signupCount, voteCount };
}

export default async function SubmissionsPage() {
  const { supabase, userId } = await checkAuthentication();

  const [userData, submissions, counts] = await Promise.all([
    fetchUserDetails(supabase, userId),
    fetchUserSubmissions(supabase, userId),
    fetchCounts(supabase, userId)
  ]);

  if (!userData) {
    redirect('/login?redirect=/dashboard/profile/submissions');
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <ProfileHeader
          user={userData}
          signupCount={counts.signupCount}
          submissionCount={submissions.length}
          voteCount={counts.voteCount}
        />
      </div>

      <ProfileTabs
        signupCount={counts.signupCount}
        submissionCount={submissions.length}
        voteCount={counts.voteCount}
      />

      <SubmissionsTab submissions={submissions} />
    </div>
  );
}
