/**
 * Data fetchers for dashboard panels
 * 
 * Each function fetches and transforms data for a specific panel
 */

import { 
  roundProvider, 
  userParticipationProvider, 
  getVotesByUserForRoundWithDetails,
  getNextRoundByVotingDate,
  getUserSignupData,
  getUserReflectionsForRound
} from "@eptss/data-access";
import { getAuthUser } from "@eptss/data-access/utils/supabase/server";
import { Navigation } from "@eptss/shared";
import type { 
  ActionPanelData, 
  CurrentRoundData,
  PhaseStatusData,
  Phase 
} from "@eptss/dashboard/panels";

/**
 * Fetch data for the Hero Panel
 */
export async function fetchHeroData() {
  const currentRound = await roundProvider();
  
  if (!currentRound) {
    return null;
  }

  return {
    roundId: currentRound.roundId,
    songTitle: currentRound.song?.title,
    songArtist: currentRound.song?.artist,
  };
}

/**
 * Calculate urgency level based on days remaining
 */
function calculateUrgencyLevel(phaseCloses: string | undefined): 'normal' | 'warning' | 'urgent' {
  if (!phaseCloses) return 'normal';
  
  const now = new Date();
  const closes = new Date(phaseCloses);
  const diff = closes.getTime() - now.getTime();
  const daysRemaining = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (daysRemaining < 1) return 'urgent';
  if (daysRemaining < 3) return 'warning';
  return 'normal';
}

/**
 * Format time remaining for display
 */
function formatTimeRemaining(phaseCloses: string | undefined): string {
  if (!phaseCloses) return '';
  
  const now = new Date();
  const closes = new Date(phaseCloses);
  const diff = closes.getTime() - now.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'}, ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
}

/**
 * Fetch data for the Phase Status Panel
 */
export async function fetchPhaseStatusData(): Promise<PhaseStatusData | null> {
  const currentRound = await roundProvider();

  if (!currentRound) {
    return null;
  }

  const { phase, dateLabels } = currentRound;
  const phaseCloses = dateLabels[phase]?.closes;
  const timeRemaining = formatTimeRemaining(phaseCloses);
  const urgencyLevel = calculateUrgencyLevel(phaseCloses);

  // Phase-specific messages
  const phaseMessages: Record<Phase, string> = {
    signups: 'Suggest a song and sign up to participate',
    voting: 'Vote on which song should be covered this round',
    covering: 'Record and submit your cover of the selected song',
    celebration: 'Join us for the listening party event!',
  };

  return {
    phase: phase as Phase,
    timeRemaining,
    urgencyLevel,
    message: phaseMessages[phase as Phase],
  };
}

/**
 * Fetch data for the Action Panel
 */
export async function fetchActionData(): Promise<ActionPanelData | null> {
  const [currentRound, { roundDetails }] = await Promise.all([
    roundProvider(),
    userParticipationProvider(),
  ]);

  if (!currentRound) {
    return null;
  }

  const { phase, roundId, slug } = currentRound;

  // Determine action based on phase and user status
  // Note: Time remaining is now shown in PhaseStatusPanel, not here
  switch (phase) {
    case 'signups':
      return {
        actionText: roundDetails?.hasSignedUp ? 'Update Song Suggestion' : 'Sign Up for Round',
        actionHref: roundDetails?.hasSignedUp 
          ? `${Navigation.SignUp}?update=true` 
          : Navigation.SignUp,
        contextMessage: roundDetails?.hasSignedUp
          ? 'Change your song suggestion before signups close.'
          : 'Join the current round and suggest a song for everyone to cover!',
        isHighPriority: true,
      };

    case 'voting':
      // If user hasn't signed up, offer late signup option
      if (!roundDetails?.hasSignedUp) {
        return {
          actionText: 'Join Round (Late Signup)',
          actionHref: '#late-signup',
          contextMessage: 'Join this round without selecting a song. You can still participate in voting and covering!',
          isHighPriority: true,
          isLateSignup: true,
        };
      }

      return {
        actionText: roundDetails.hasVoted ? 'Update Your Votes' : 'Cast Your Votes',
        actionHref: `${Navigation.Voting}?update=true`,
        contextMessage: roundDetails.hasVoted
          ? 'Change your votes before voting closes.'
          : 'Vote on which song suggestions should be covered this round!',
        isHighPriority: !roundDetails.hasVoted,
      };

    case 'covering':
      // If user hasn't signed up, offer late signup option
      if (!roundDetails?.hasSignedUp) {
        return {
          actionText: 'Join Round (Late Signup)',
          actionHref: '#late-signup',
          contextMessage: 'Join this round without selecting a song. You can still submit a cover!',
          isHighPriority: true,
          isLateSignup: true,
        };
      }

      return {
        actionText: roundDetails.hasSubmitted ? 'Update Submission' : 'Submit Your Cover',
        actionHref: Navigation.Submit,
        contextMessage: roundDetails.hasSubmitted
          ? 'Update your cover submission before the deadline.'
          : 'Record and submit your cover of the selected song!',
        isHighPriority: !roundDetails.hasSubmitted,
      };

    case 'celebration':
      return {
        actionText: 'View Listening Party Details',
        actionHref: `/round/${slug}`,
        contextMessage: '🎉 Join us for the listening party to celebrate this round!',
        isHighPriority: false,
      };

    default:
      return null;
  }
}

/**
 * Fetch data for the Current Round Panel
 */
export async function fetchCurrentRoundData(): Promise<CurrentRoundData | null> {
  const [currentRound, { roundDetails }, { userId }] = await Promise.all([
    roundProvider(),
    userParticipationProvider(),
    getAuthUser(),
  ]);

  if (!currentRound) {
    return null;
  }

  // Get user votes if in voting phase and has voted
  let userVotesWithDetails = null;
  if (currentRound.phase === 'voting' && roundDetails?.hasVoted && currentRound.roundId) {
    userVotesWithDetails = await getVotesByUserForRoundWithDetails(currentRound.roundId);
  }

  // Find user's song suggestion if they've signed up
  let userSongSuggestion = undefined;
  if (roundDetails?.hasSignedUp && currentRound.signups && userId) {
    const userSignup = currentRound.signups.find(
      (signup) => signup.userId === userId
    );
    if (userSignup?.song) {
      userSongSuggestion = {
        title: userSignup.song.title,
        artist: userSignup.song.artist,
      };
    }
  }

  return {
    roundId: currentRound.roundId,
    phase: currentRound.phase as Phase,
    hasSignedUp: roundDetails?.hasSignedUp || false,
    hasSubmitted: roundDetails?.hasSubmitted || false,
    hasVoted: roundDetails?.hasVoted || false,
    phaseCloses: currentRound.dateLabels[currentRound.phase]?.closes,
    currentSignups: currentRound.signups?.length,
    userSongSuggestion,
    userVotes: userVotesWithDetails || undefined,
  };
}

/**
 * Fetch data for the Reflection Panel
 */
export async function fetchReflectionData() {
  const [currentRound, { userId }] = await Promise.all([
    roundProvider(),
    getAuthUser(),
  ]);

  if (!currentRound || !userId) {
    return null;
  }

  const reflectionsResult = await getUserReflectionsForRound(userId, currentRound.roundId);

  // Handle AsyncResult
  if (reflectionsResult.status !== 'success') {
    return {
      roundSlug: currentRound.slug,
      round: {
        roundId: currentRound.roundId,
        slug: currentRound.slug,
        signupOpens: currentRound.signupOpens,
        votingOpens: currentRound.votingOpens,
        coveringBegins: currentRound.coveringBegins,
        coversDue: currentRound.coversDue,
        listeningParty: currentRound.listeningParty,
        song: currentRound.song || { artist: '', title: '' },
      },
      reflections: [],
    };
  }

  return {
    roundSlug: currentRound.slug,
    round: {
      roundId: currentRound.roundId,
      slug: currentRound.slug,
      signupOpens: currentRound.signupOpens,
      votingOpens: currentRound.votingOpens,
      coveringBegins: currentRound.coveringBegins,
      coversDue: currentRound.coversDue,
      listeningParty: currentRound.listeningParty,
      song: currentRound.song || { artist: '', title: '' },
    },
    reflections: reflectionsResult.data,
  };
}

/**
 * Fetch data for Next Round Panel (if needed in future)
 */
export async function fetchNextRoundData() {
  const [nextRoundResult, { userId }] = await Promise.all([
    getNextRoundByVotingDate(),
    getAuthUser(),
  ]);

  const nextRound = nextRoundResult.status === 'success' ? nextRoundResult.data : null;

  if (!nextRound || !userId) {
    return null;
  }

  const nextRoundUserSignup = await getUserSignupData(userId, nextRound.roundId);

  return {
    nextRound,
    nextRoundUserSignup,
  };
}

/**
 * Fetch data for the Round Participants Panel
 */
export async function fetchParticipantsData() {
  const roundInfo = await roundProvider();

  if (!roundInfo) {
    return null;
  }

  return {
    roundInfo,
  };
}
