"use server";

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthUser } from '@/utils/supabase/server';
import type { VoteRow, GroupedVote, GroupedSignup, SignupItem, RoundMetadataSubset } from '@eptss/profile/types';
import { ProfileHeader, ProfileTabs, OverviewTab } from '@eptss/profile';

// Type definitions for internal data structures
interface RoundSignups {
  signups: Array<SignupItem>;
  roundMetadata: RoundMetadataSubset | null;
}

type SubmissionRow = {
  id: number;
  created_at: string;
  soundcloud_url: string;
  round_id: number;
  user_id: string;
  additional_comments: string | null;
  round_metadata: {
    id: number;
    slug: string | null;
    signup_opens: string | null;
    covering_begins: string | null;
    covers_due: string | null;
    songs: {
      title: string;
      artist: string;
    } | null;
  } | null;
};

type VoteQueryRow = {
  id: number;
  created_at: string;
  vote: number;
  song_id: number;
  user_id: string;
  round_id: number;
  round_metadata: {
    slug: string | null;
  } | null;
};

// Helper function to check authentication and redirect if not authenticated
async function checkAuthentication() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login?redirect=/profile');
  }

  return { supabase, userId: (await getAuthUser()).userId };
}

// Helper function to fetch user details
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

// Helper function to fetch user signups
async function fetchUserSignups(supabase: any, userId: string) {
  const { data: rawSignups, error: signupsError } = await supabase
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

  if (signupsError) {
    console.error('Error fetching signups:', signupsError);
  }

  return { rawSignups, signupsError };
}

// Helper function to extract round metadata from a signup
function extractRoundMetadata(roundMetadataData: any): RoundMetadataSubset | null {
  if (!roundMetadataData) return null;

  // Handle both array and object formats
  const rm = Array.isArray(roundMetadataData) && roundMetadataData.length > 0
    ? roundMetadataData[0]
    : roundMetadataData;

  // Use type assertion to avoid TypeScript errors
  return {
    id: (rm as any).id || 0,
    slug: (rm as any).slug || null,
    signup_opens: (rm as any).signup_opens || null,
    covering_begins: (rm as any).covering_begins || null,
    covers_due: (rm as any).covers_due || null
  };
}

// Helper function to extract song information from a signup
function extractSongInfo(songData: any) {
  if (!songData) return { title: 'Unknown Title', artist: 'Unknown Artist' };

  if (Array.isArray(songData) && songData.length > 0) {
    // Handle case where it's returned as an array
    return {
      title: songData[0].title || 'Unknown Title',
      artist: songData[0].artist || 'Unknown Artist'
    };
  } else {
    // Handle case where it's returned as a single object
    return {
      title: songData.title || 'Unknown Title',
      artist: songData.artist || 'Unknown Artist'
    };
  }
}

// Helper function to group signups by round
function groupSignupsByRound(rawSignups: any[]): GroupedSignup[] {
  if (!rawSignups) return [];

  const groupedMap: Map<number, RoundSignups> = new Map();

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

// Helper function to fetch user submissions
async function fetchUserSubmissions(supabase: any, userId: string) {
  const { data: rawSubmissions, error: submissionsError } = await supabase
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

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError);
  }

  if (!rawSubmissions) return [];

  // Map submissions to include song info from round metadata
  const submissionsWithSongs = rawSubmissions.map((submission: SubmissionRow) => {
    const roundMetadata = extractRoundMetadata(submission.round_metadata);

    // Get song info from the round's assigned song
    let songInfo = { title: 'Unknown Title', artist: 'Unknown Artist' };
    if (submission.round_metadata?.songs) {
      songInfo = extractSongInfo(submission.round_metadata.songs);
    }

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

  return submissionsWithSongs;
}

// Helper function to fetch user votes
async function fetchUserVotes(supabase: any, userId: string): Promise<GroupedVote[]> {
  const { data: rawVotes, error: votesError } = await supabase
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

  if (votesError) {
    console.error('Error fetching votes:', votesError);
  }

  if (!rawVotes) return [];

  // Group votes by round_slug
  const votesGroupedByRound: Map<string, VoteRow[]> = new Map();

  rawVotes.forEach((vote: VoteQueryRow) => {
    const roundSlug = vote.round_metadata?.slug;

    if (!roundSlug) return;

    const voteRow: VoteRow = {
      id: vote.id,
      created_at: vote.created_at,
      vote: vote.vote,
      round_slug: roundSlug,
      song_id: vote.song_id,
      user_id: vote.user_id,
      submitter_email: null // We don't need submitter email for the profile display
    };

    if (!votesGroupedByRound.has(roundSlug)) {
      votesGroupedByRound.set(roundSlug, []);
    }

    votesGroupedByRound.get(roundSlug)!.push(voteRow);
  });

  // Convert grouped votes to GroupedVote array
  return Array.from(votesGroupedByRound.entries()).map(([roundSlug, votes]) => ({
    round_slug: roundSlug,
    count: votes.length,
    latest_vote_date: votes[0]?.created_at || null,
    votes
  }));
}

export default async function ProfilePage() {
  // Check authentication
  const { supabase, userId } = await checkAuthentication();

  // Fetch all profile data in parallel
  const [userData, { rawSignups, signupsError }, submissions, votes] = await Promise.all([
    fetchUserDetails(supabase, userId),
    fetchUserSignups(supabase, userId),
    fetchUserSubmissions(supabase, userId),
    fetchUserVotes(supabase, userId)
  ]);

  // Process signups
  const signups = signupsError ? [] : groupSignupsByRound(rawSignups || []);

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
