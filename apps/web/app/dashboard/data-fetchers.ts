/**
 * Data fetchers for dashboard panels
 * 
 * Each function fetches and transforms data for a specific panel
 */

import {
  roundProvider,
  userParticipationProvider,
  getNextRoundByVotingDate,
  getUserSignupData,
  getUserReflectionsForRound,
  type Reflection
} from "@eptss/data-access";
import { getAuthUser } from "@eptss/data-access/utils/supabase/server";
import { Navigation } from "@eptss/shared";
import { getProjectRoute } from "@/lib/projects";
import type {
  Phase
} from "@eptss/dashboard/panels";

/**
 * Fetch data for the Hero Panel
 * @param projectId - Project ID to scope data to a specific project
 */
export async function fetchHeroData(projectId: string) {
  const currentRound = await roundProvider({ projectId });

  if (!currentRound) {
    return null;
  }

  return {
    roundId: currentRound.roundId,
    roundSlug: currentRound.slug,
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
 * Fetch data for the Action Panel (now includes reflections, phase status, and progress)
 * @param projectId - Project ID to scope data to a specific project
 * @param projectSlug - Project slug for generating project-scoped URLs (e.g., 'cover', 'original')
 */
export async function fetchActionData(projectId: string, projectSlug: string) {
  // Get auth user first to fetch reflections
  const { userId } = await getAuthUser();

  const [currentRound, { roundDetails }] = await Promise.all([
    roundProvider({ projectId }),
    userParticipationProvider({ projectId }),
  ]);

  if (!currentRound) {
    return null;
  }

  const { phase, roundId, slug, dateLabels } = currentRound;

  // Fetch reflections for this round
  let reflections: Reflection[] = [];
  if (userId) {
    const reflectionsResult = await getUserReflectionsForRound(userId, currentRound.roundId);
    if (reflectionsResult.status === 'success') {
      reflections = reflectionsResult.data;
    }
  }

  // Phase status info
  const phaseCloses = dateLabels[phase]?.closes;
  const timeRemaining = formatTimeRemaining(phaseCloses);
  const urgencyLevel = calculateUrgencyLevel(phaseCloses);
  const dueDate = phaseCloses ? new Date(phaseCloses).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }) : undefined;

  const phaseNames: Record<Phase, string> = {
    signups: 'Song Selection & Signups',
    voting: 'Voting Phase',
    covering: 'Covering Phase',
    celebration: 'Listening Party',
  };

  const phaseMessages: Record<Phase, string> = {
    signups: 'Suggest a song and sign up to participate',
    voting: 'Vote on which song should be covered this round',
    covering: 'Record and submit your cover of the selected song',
    celebration: 'Join us for the listening party event!',
  };

  // Generate project-scoped URLs
  const signupUrl = getProjectRoute(projectSlug, 'sign-up');
  const votingUrl = getProjectRoute(projectSlug, 'voting');
  const submitUrl = getProjectRoute(projectSlug, 'submit');
  const roundUrl = getProjectRoute(projectSlug, `round/${slug}`);

  // Determine action based on phase and user status
  switch (phase) {
    case 'signups':
      return {
        actionText: roundDetails?.hasSignedUp ? 'Update Song Suggestion' : 'Sign Up for Round',
        actionHref: roundDetails?.hasSignedUp
          ? `${signupUrl}?update=true`
          : signupUrl,
        contextMessage: roundDetails?.hasSignedUp
          ? 'Change your song suggestion before signups close.'
          : 'Join the current round and suggest a song for everyone to cover!',
        isHighPriority: true,
        reflections,
        roundSlug: slug,
        phase: phase as Phase,
        phaseName: phaseNames[phase as Phase],
        phaseMessage: phaseMessages[phase as Phase],
        timeRemaining,
        dueDate,
        urgencyLevel,
        hasSignedUp: roundDetails?.hasSignedUp || false,
        hasSubmitted: roundDetails?.hasSubmitted || false,
        hasVoted: roundDetails?.hasVoted || false,
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
          reflections,
          roundSlug: slug,
          phase: phase as Phase,
          phaseName: phaseNames[phase as Phase],
          phaseMessage: phaseMessages[phase as Phase],
          timeRemaining,
          dueDate,
          urgencyLevel,
          hasSignedUp: roundDetails?.hasSignedUp || false,
          hasSubmitted: roundDetails?.hasSubmitted || false,
          hasVoted: roundDetails?.hasVoted || false,
        };
      }

      return {
        actionText: roundDetails.hasVoted ? 'Update Your Votes' : 'Cast Your Votes',
        actionHref: `${votingUrl}?update=true`,
        contextMessage: roundDetails.hasVoted
          ? 'Change your votes before voting closes.'
          : 'Vote on which song suggestions should be covered this round!',
        isHighPriority: !roundDetails.hasVoted,
        reflections,
        roundSlug: slug,
        phase: phase as Phase,
        phaseName: phaseNames[phase as Phase],
        phaseMessage: phaseMessages[phase as Phase],
        timeRemaining,
        dueDate,
        urgencyLevel,
        hasSignedUp: roundDetails?.hasSignedUp || false,
        hasSubmitted: roundDetails?.hasSubmitted || false,
        hasVoted: roundDetails?.hasVoted || false,
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
          reflections,
          roundSlug: slug,
          phase: phase as Phase,
          phaseName: phaseNames[phase as Phase],
          phaseMessage: phaseMessages[phase as Phase],
          timeRemaining,
          dueDate,
          urgencyLevel,
          hasSignedUp: roundDetails?.hasSignedUp || false,
          hasSubmitted: roundDetails?.hasSubmitted || false,
          hasVoted: roundDetails?.hasVoted || false,
        };
      }

      return {
        actionText: roundDetails.hasSubmitted ? 'Update Submission' : 'Submit Your Cover',
        actionHref: submitUrl,
        contextMessage: roundDetails.hasSubmitted
          ? 'Update your cover submission before the deadline.'
          : 'Record and submit your cover of the selected song!',
        isHighPriority: !roundDetails.hasSubmitted,
        reflections,
        roundSlug: slug,
        phase: phase as Phase,
        phaseName: phaseNames[phase as Phase],
        phaseMessage: phaseMessages[phase as Phase],
        timeRemaining,
        dueDate,
        urgencyLevel,
        hasSignedUp: roundDetails?.hasSignedUp || false,
        hasSubmitted: roundDetails?.hasSubmitted || false,
        hasVoted: roundDetails?.hasVoted || false,
      };

    case 'celebration':
      return {
        actionText: 'View Listening Party Details',
        actionHref: roundUrl,
        contextMessage: '🎉 Join us for the listening party to celebrate this round!',
        isHighPriority: false,
        reflections,
        roundSlug: slug,
        phase: phase as Phase,
        phaseName: phaseNames[phase as Phase],
        phaseMessage: phaseMessages[phase as Phase],
        timeRemaining,
        dueDate,
        urgencyLevel,
        hasSignedUp: roundDetails?.hasSignedUp || false,
        hasSubmitted: roundDetails?.hasSubmitted || false,
        hasVoted: roundDetails?.hasVoted || false,
      };

    default:
      return null;
  }
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
 * @param projectId - Project ID to scope data to a specific project
 */
export async function fetchParticipantsData(projectId: string) {
  const roundInfo = await roundProvider({ projectId });

  if (!roundInfo) {
    return null;
  }

  return {
    roundInfo,
  };
}
