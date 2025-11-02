"use server";

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthUser } from '@/utils/supabase/server';
import type { GroupedSignup, SignupItem, RoundMetadataSubset } from '@eptss/profile/types';
import { ProfileHeader, ProfileTabs, SignupsTab } from '@eptss/profile';

async function checkAuthentication() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirect=/dashboard/profile/signups');
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

async function fetchUserSignups(supabase: any, userId: string) {
  const { data: rawSignups } = await supabase
    .from('sign_ups')
    .select(`
      id,
      created_at,
      youtube_link,
      round_id,
      song_id,
      user_id,
      additional_comments,
      round_metadata:round_metadata!sign_ups_round_id_fkey (id, slug, signup_opens, covering_begins, covers_due),
      songs:songs!sign_ups_song_id_fkey (id, title, artist)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return rawSignups || [];
}

function extractRoundMetadata(roundMetadataData: any): RoundMetadataSubset | null {
  if (!roundMetadataData) return null;

  const rm = Array.isArray(roundMetadataData) && roundMetadataData.length > 0
    ? roundMetadataData[0]
    : roundMetadataData;

  return {
    id: (rm as any).id || 0,
    slug: (rm as any).slug || null,
    signup_opens: (rm as any).signup_opens || null,
    covering_begins: (rm as any).covering_begins || null,
    covers_due: (rm as any).covers_due || null
  };
}

function extractSongInfo(songData: any) {
  if (!songData) return { title: 'Unknown Title', artist: 'Unknown Artist' };

  if (Array.isArray(songData) && songData.length > 0) {
    return {
      title: songData[0].title || 'Unknown Title',
      artist: songData[0].artist || 'Unknown Artist'
    };
  }
  return {
    title: songData.title || 'Unknown Title',
    artist: songData.artist || 'Unknown Artist'
  };
}

function groupSignupsByRound(rawSignups: any[]): GroupedSignup[] {
  if (!rawSignups) return [];

  const groupedMap: Map<number, { signups: SignupItem[]; roundMetadata: RoundMetadataSubset | null }> = new Map();

  rawSignups.forEach((signup) => {
    const roundId = signup.round_id;
    const roundMetadata = extractRoundMetadata(signup.round_metadata);
    const songInfo = extractSongInfo(signup.songs);

    const signupItem: SignupItem = {
      id: signup.id,
      created_at: signup.created_at,
      youtube_link: signup.youtube_link,
      song_id: signup.song_id,
      user_id: signup.user_id,
      additional_comments: signup.additional_comments,
      title: songInfo.title,
      artist: songInfo.artist
    };

    if (!groupedMap.has(roundId)) {
      groupedMap.set(roundId, {
        signups: [],
        roundMetadata
      });
    }

    groupedMap.get(roundId)!.signups.push(signupItem);
  });

  return Array.from(groupedMap.entries()).map(([roundId, data]) => ({
    round_id: roundId,
    round_slug: data.roundMetadata?.slug || null,
    signup_count: data.signups.length,
    latest_signup_date: data.signups[0]?.created_at || null,
    signups: data.signups,
    round_metadata: data.roundMetadata
  }));
}

async function fetchCounts(supabase: any, userId: string) {
  const [submissionsResult, votesResult] = await Promise.all([
    supabase.from('submissions').select('id', { count: 'exact' }).eq('user_id', userId),
    supabase.from('song_selection_votes').select('round_id').eq('user_id', userId)
  ]);

  const submissionCount = submissionsResult.count || 0;
  const voteCount = votesResult.data ? new Set(votesResult.data.map(v => v.round_id)).size : 0;

  return { submissionCount, voteCount };
}

export default async function SignupsPage() {
  const { supabase, userId } = await checkAuthentication();

  const [userData, rawSignups, counts] = await Promise.all([
    fetchUserDetails(supabase, userId),
    fetchUserSignups(supabase, userId),
    fetchCounts(supabase, userId)
  ]);

  const signups = groupSignupsByRound(rawSignups);

  if (!userData) {
    redirect('/login?redirect=/dashboard/profile/signups');
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <ProfileHeader
          user={userData}
          signupCount={signups.length}
          submissionCount={counts.submissionCount}
          voteCount={counts.voteCount}
        />
      </div>

      <ProfileTabs
        signupCount={signups.length}
        submissionCount={counts.submissionCount}
        voteCount={counts.voteCount}
      />

      <SignupsTab signups={signups} />
    </div>
  );
}
