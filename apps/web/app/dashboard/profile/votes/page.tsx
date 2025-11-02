"use server";

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthUser } from '@/utils/supabase/server';
import type { GroupedVote, VoteRow } from '@eptss/profile/types';
import { ProfileHeader, ProfileTabs, VotesTab } from '@eptss/profile';

async function checkAuthentication() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirect=/dashboard/profile/votes');
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

async function fetchUserVotes(supabase: any, userId: string): Promise<GroupedVote[]> {
  const { data: rawVotes } = await supabase
    .from('song_selection_votes')
    .select(`
      id,
      created_at,
      vote,
      song_id,
      user_id,
      round_id,
      round_metadata:round_metadata!song_selection_votes_round_id_fkey (slug)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!rawVotes) return [];

  const votesGroupedByRound: Map<string, VoteRow[]> = new Map();

  rawVotes.forEach((vote: any) => {
    const roundSlug = vote.round_metadata?.slug;
    if (!roundSlug) return;

    const voteRow: VoteRow = {
      id: vote.id,
      created_at: vote.created_at,
      vote: vote.vote,
      round_slug: roundSlug,
      song_id: vote.song_id,
      user_id: vote.user_id,
      submitter_email: null
    };

    if (!votesGroupedByRound.has(roundSlug)) {
      votesGroupedByRound.set(roundSlug, []);
    }

    votesGroupedByRound.get(roundSlug)!.push(voteRow);
  });

  return Array.from(votesGroupedByRound.entries()).map(([roundSlug, votes]) => ({
    round_slug: roundSlug,
    count: votes.length,
    latest_vote_date: votes[0]?.created_at || null,
    votes
  }));
}

async function fetchCounts(supabase: any, userId: string) {
  const [signupsResult, submissionsResult] = await Promise.all([
    supabase.from('sign_ups').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('submissions').select('id', { count: 'exact' }).eq('user_id', userId)
  ]);

  const signupCount = signupsResult.count || 0;
  const submissionCount = submissionsResult.count || 0;

  return { signupCount, submissionCount };
}

export default async function VotesPage() {
  const { supabase, userId } = await checkAuthentication();

  const [userData, votes, counts] = await Promise.all([
    fetchUserDetails(supabase, userId),
    fetchUserVotes(supabase, userId),
    fetchCounts(supabase, userId)
  ]);

  if (!userData) {
    redirect('/login?redirect=/dashboard/profile/votes');
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <ProfileHeader
          user={userData}
          signupCount={counts.signupCount}
          submissionCount={counts.submissionCount}
          voteCount={votes.length}
        />
      </div>

      <ProfileTabs
        signupCount={counts.signupCount}
        submissionCount={counts.submissionCount}
        voteCount={votes.length}
      />

      <VotesTab votes={votes} />
    </div>
  );
}
