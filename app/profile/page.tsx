"use server";

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAuthUser } from '@/utils/supabase/server';
import { VoteRow, GroupedVote, GroupedSignup, SignupItem, RoundMetadataSubset } from './types';
import { ProfilePageClient } from './ProfilePageClient/ProfilePageClient';

// Type definitions for internal data structures
interface RoundSignups {
  signups: Array<SignupItem>;
  roundMetadata: RoundMetadataSubset | null;
}

// Helper function to check authentication and redirect if not authenticated
async function checkAuthentication() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login?redirect=/profile');
  }
  
  return { supabase, userId: getAuthUser().userId };
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
  } else if (rawSignups && rawSignups.length > 0) {
    console.log('First signup data:', JSON.stringify(rawSignups[0], null, 2));
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
function groupSignupsByRound(rawSignups: any[]): Record<number, RoundSignups> {
  const signupsByRound: Record<number, RoundSignups> = {};
  
  rawSignups.forEach(signup => {
    const roundId = signup.round_id;
    
    // Log the raw round metadata for debugging
    console.log('Raw round metadata for signup:', {
      roundId,
      signupId: signup.id,
      roundMetadata: signup.round_metadata ? JSON.stringify(signup.round_metadata, null, 2) : 'None'
    });
    
    // Initialize the round data if it doesn't exist yet
    if (!signupsByRound[roundId]) {
      signupsByRound[roundId] = { 
        signups: [],
        roundMetadata: extractRoundMetadata(signup.round_metadata)
      };
    }

    // Extract song title and artist
    const songInfo = extractSongInfo(signup.songs);
    
    // Add this signup to the round's array
    signupsByRound[roundId].signups.push({
      id: signup.id,
      created_at: signup.created_at,
      youtube_link: signup.youtube_link,
      song_id: signup.song_id,
      user_id: signup.user_id,
      additional_comments: signup.additional_comments,
      title: songInfo.title,
      artist: songInfo.artist
    });
  });
  
  return signupsByRound;
}

// Helper function to transform grouped signups to the format expected by the client
function transformSignupsForClient(signupsByRound: Record<number, RoundSignups>): GroupedSignup[] {
  return Object.entries(signupsByRound).map(([roundId, roundData]) => {
    // Get the most recent signup date for this round
    const latestSignup = [...roundData.signups].sort((a, b) => 
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    )[0];

    // Ensure we have a valid round_slug, defaulting to the roundId if not available
    const roundSlug = roundData.roundMetadata && roundData.roundMetadata.slug ? 
      roundData.roundMetadata.slug : 
      `${roundId}`;
    
    return {
      round_id: parseInt(roundId),
      round_slug: roundSlug,
      signup_count: roundData.signups.length,
      latest_signup_date: latestSignup.created_at,
      signups: roundData.signups,
      round_metadata: roundData.roundMetadata
    };
  }).sort((a, b) => new Date(b.latest_signup_date || '').getTime() - new Date(a.latest_signup_date || '').getTime());
}

// Helper function to fetch song information for submissions
async function fetchSongInfoForSubmissions(supabase: any, submissions: any[]) {
  // Get all round IDs
  const roundIds = [...new Set(submissions.map(s => s.round_id))];
  
  // Initialize song info map
  const songInfo: Record<number, { title: string | null; artist: string | null }> = {};
  
  // Fetch round metadata with song information
  const { data: roundsData } = await supabase
    .from('round_metadata')
    .select(`
      id,
      song_id,
      songs:songs!round_metadata_song_id_fkey (id, title, artist)
    `)
    .in('id', roundIds);
  
  // Create a lookup map of round_id to song info
  if (roundsData) {
    roundsData.forEach((round: any) => {
      if (round.songs && Array.isArray(round.songs) && round.songs.length > 0) {
        songInfo[round.id] = {
          title: round.songs[0].title || null,
          artist: round.songs[0].artist || null
        };
      }
    });
  }
  
  return songInfo;
}

// Helper function to fetch user submissions with song information
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
      round_metadata:round_metadata!submissions_round_id_fkey (id, slug, signup_opens, covering_begins, covers_due, song_id)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Process submissions if available
  let submissions: any[] = [];
  if (rawSubmissions && rawSubmissions.length > 0) {
    // Get song information for all rounds
    const songInfo = await fetchSongInfoForSubmissions(supabase, rawSubmissions);
    
    // Transform submissions to match expected type
    submissions = rawSubmissions.map((submission: any) => {
      // Get song info for this submission's round
      const roundSongInfo = songInfo[submission.round_id] || { title: null, artist: null };
      
      return {
        id: submission.id,
        created_at: submission.created_at,
        title: roundSongInfo.title,
        artist: roundSongInfo.artist,
        soundcloud_url: submission.soundcloud_url,
        round_id: submission.round_id,
        user_id: submission.user_id,
        additional_comments: submission.additional_comments,
        round_metadata: extractRoundMetadata(submission.round_metadata)
      };
    });
  }
  
  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError);
  }
  
  return { submissions, submissionsError };
}

// Helper function to fetch and process user votes
async function fetchUserVotes(supabase: any, userId: string) {
  const { data: rawVotes, error: votesError } = await supabase
    .from('song_selection_votes')
    .select(`
      id,
      created_at,
      vote,
      round_id,
      song_id,
      user_id,
      submitter_email
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  // Group votes by round
  const votesByRound = rawVotes ? rawVotes.reduce((acc: Record<string, GroupedVote>, vote: any) => {
    const roundId = vote.round_id;
    const roundSlug = vote.round_slug || `${roundId}`;
    
    if (!acc[roundSlug]) {
      acc[roundSlug] = {
        round_slug: roundSlug,
        count: 0,
        latest_vote_date: null,
        votes: [],
      };
    }
    
    acc[roundSlug].count += 1;
    // Cast vote to the expected type and push it
    acc[roundSlug].votes.push(vote as VoteRow);
    
    // Track the most recent vote date
    if (!acc[roundSlug].latest_vote_date) {
      // If no latest date exists yet, set it to the current vote's date
      acc[roundSlug].latest_vote_date = vote.created_at;
    } else if (vote.created_at && acc[roundSlug].latest_vote_date) {
      // We've already checked that both values are non-null
      // Use string type assertion to satisfy TypeScript
      const voteDate = new Date(vote.created_at);
      const latestVoteDate = acc[roundSlug].latest_vote_date as string; // Type assertion
      const currentLatestDate = new Date(latestVoteDate);
      
      if (voteDate > currentLatestDate) {
        acc[roundSlug].latest_vote_date = vote.created_at;
      }
    }
    
    return acc;
  }, {}) : {};
  
  // Convert to array and sort by most recent vote
  const voteValues = Object.values(votesByRound);
  const typedVotes = voteValues as GroupedVote[];
  const votes = typedVotes.sort((a, b) => {
    // Handle null cases first
    if (!a.latest_vote_date) return 1; // a has no date, so b comes first
    if (!b.latest_vote_date) return -1; // b has no date, so a comes first
    
    // Both dates exist, so we can safely create Date objects with type assertions
    const dateA = new Date(a.latest_vote_date as string);
    const dateB = new Date(b.latest_vote_date as string);
    
    // Sort by most recent first (descending order)
    return dateB.getTime() - dateA.getTime();
  });
  
  if (votesError) {
    console.error('Error fetching votes:', votesError);
  }
  
  return { votes, votesError };
}

/**
 * Main ProfilePage component
 * Fetches all user data and renders the profile page
 */
export default async function ProfilePage() {
  // Check authentication and get user ID
  const { supabase, userId } = await checkAuthentication();
  
  // Fetch user details
  const userData = await fetchUserDetails(supabase, userId);
  
  // Fetch user signups
  const { rawSignups, signupsError } = await fetchUserSignups(supabase, userId);
  
  // Process signups data
  const signups = rawSignups ? 
    transformSignupsForClient(groupSignupsByRound(rawSignups)) : 
    [];
  
  if (signupsError) {
    console.error('Error fetching signups:', signupsError);
  }
  
  // Fetch user submissions and related song information
  const { submissions, submissionsError } = await fetchUserSubmissions(supabase, userId);
  
  // Fetch and process user votes
  const { votes, votesError } = await fetchUserVotes(supabase, userId);
  
  return (
    <div>
      <ProfilePageClient 
        user={userData} 
        signups={signups} 
        submissions={submissions} 
        votes={votes || []}
      />
    </div>
  );
}
