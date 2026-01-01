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
  getRoundPrompt,
  getProjectBySlug,
  type Reflection,
  type ProjectSlug,
} from "@eptss/data-access";
import { getAuthUser } from "@eptss/data-access/utils/supabase/server";
import { routes } from "@eptss/routing";
import { getProjectTerminology, getProjectBusinessRules, getProjectConfig } from "@eptss/project-config";
import type {
  Phase
} from "@eptss/dashboard/panels";
import { getCommentsAction } from "@eptss/comments/actions";
import { getSignupsByRound } from "@eptss/data-access/services/signupService";

/**
 * Fetch data for the Hero Panel
 * @param projectId - Project ID to scope data to a specific project
 * @param projectSlug - Project slug for fetching terminology
 */
export async function fetchHeroData(projectId: string, projectSlug: string) {
  console.log('[fetchHeroData] Called with projectId:', projectId, 'projectSlug:', projectSlug);

  const [currentRound, { roundDetails }, terminology, businessRules, project, projectConfig] = await Promise.all([
    roundProvider({ projectId }),
    userParticipationProvider({ projectId }),
    getProjectTerminology(projectSlug as ProjectSlug),
    getProjectBusinessRules(projectSlug as ProjectSlug),
    getProjectBySlug(projectSlug),
    getProjectConfig(projectSlug as ProjectSlug),
  ]);

  console.log('[fetchHeroData] Fetched terminology:', JSON.stringify(terminology, null, 2));

  if (!currentRound) {
    console.log('[fetchHeroData] No current round found');
    return null;
  }

  // Fetch the round prompt if this project requires prompts
  let promptText: string | null = null;
  if (businessRules.requirePrompt) {
    const promptResult = await getRoundPrompt(currentRound.roundId);
    if (promptResult.status === 'success') {
      promptText = promptResult.data;
    }
  }

  // Calculate countdown/deadline data
  const phaseCloses = currentRound.dateLabels[currentRound.phase]?.closes;
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

  const heroData = {
    roundId: currentRound.roundId,
    roundSlug: currentRound.slug,
    songTitle: currentRound.song?.title,
    songArtist: currentRound.song?.artist,
    currentPhase: currentRound.phase,
    terminology,
    requirePrompt: businessRules.requirePrompt,
    promptText,
    projectName: project?.name,
    projectSlug,
    submitCtaLabel: projectConfig.content.pages.dashboard.submissionCtaLabel,
    // Countdown/deadline data
    timeRemaining,
    dueDate,
    urgencyLevel,
    // User progress
    hasSignedUp: roundDetails?.hasSignedUp || false,
    hasVoted: roundDetails?.hasVoted || false,
    hasSubmitted: roundDetails?.hasSubmitted || false,
    // Project features
    votingEnabled: currentRound.votingEnabled,
  };

  console.log('[fetchHeroData] Returning heroData:', JSON.stringify(heroData, null, 2));

  return heroData;
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
  console.log('[fetchActionData] Called with projectId:', projectId, 'projectSlug:', projectSlug);

  // Get auth user first to fetch reflections
  const { userId } = await getAuthUser();

  const [currentRound, { roundDetails }, terminology, businessRules] = await Promise.all([
    roundProvider({ projectId }),
    userParticipationProvider({ projectId }),
    getProjectTerminology(projectSlug as ProjectSlug),
    getProjectBusinessRules(projectSlug as ProjectSlug),
  ]);


  if (!currentRound) {
    console.log('[fetchActionData] No current round found');
    return null;
  }

  const { phase, roundId, slug, dateLabels } = currentRound;
  console.log('[fetchActionData] Current phase:', phase);

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

  // Use project-specific terminology
  const phaseNames: Record<Phase, string> = {
    signups: terminology.phases.signups,
    voting: terminology.phases.voting,
    covering: terminology.phases.covering,
    celebration: terminology.phases.celebration,
  };

  const phaseMessages: Record<Phase, string> = {
    signups: terminology.phaseDescriptions.signups,
    voting: terminology.phaseDescriptions.voting,
    covering: terminology.phaseDescriptions.covering,
    celebration: terminology.phaseDescriptions.celebration,
  };

  console.log('[fetchActionData] Phase names:', JSON.stringify(phaseNames, null, 2));
  console.log('[fetchActionData] Phase messages:', JSON.stringify(phaseMessages, null, 2));

  // Generate project-scoped URLs
  const signupUrl = routes.projects.signUp.root(projectSlug);
  const votingUrl = routes.projects.voting.root(projectSlug);
  const submitUrl = routes.projects.submit.root(projectSlug);
  const roundUrl = routes.projects.rounds.detail(projectSlug, slug);

  // Determine action based on phase and user status
  switch (phase) {
    case 'signups':
      // If user has signed up and there's no song to update, they're done
      if (roundDetails?.hasSignedUp && !businessRules.requireSongOnSignup) {
        return {
          actionText: 'Invite Friends to Join',
          actionHref: '#invite-friends',
          contextMessage: "You're all set! The round will start soon. Invite your friends to participate!",
          isHighPriority: false,
          showInviteLink: true,
          reflections,
          roundSlug: slug,
          projectSlug,
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

      // Determine action text and context message based on whether song selection is required
      const actionText = roundDetails?.hasSignedUp
        ? 'Update Song Suggestion'
        : 'Sign Up for Round';

      const contextMessage = roundDetails?.hasSignedUp
        ? 'Change your song suggestion before signups close.'
        : (businessRules.requireSongOnSignup
            ? 'Join the current round and suggest a song for everyone to cover!'
            : 'Join the current round and participate!');

      return {
        actionText,
        actionHref: roundDetails?.hasSignedUp
          ? `${signupUrl}?update=true`
          : signupUrl,
        contextMessage,
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
      // If voting is disabled for this project, show a message about the next phase
      if (!currentRound.votingEnabled) {
        // If user hasn't signed up, offer late signup option
        if (!roundDetails?.hasSignedUp) {
          return {
            actionText: 'Join Round (Late Signup)',
            actionHref: '#late-signup',
            contextMessage: `Join this round and participate!`,
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

        // For projects with voting disabled, encourage inviting others during preparation
        return {
          actionText: 'Invite Friends to Join',
          actionHref: '#invite-friends',
          contextMessage: 'The prompt will be revealed soon. Invite your friends to participate!',
          isHighPriority: true,
          showInviteLink: true, // Flag to trigger invite link generation in the UI
          reflections,
          roundSlug: slug,
          projectSlug,
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
          projectSlug,
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
          projectSlug,
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

/**
 * Fetch data for the Discussion Panel (Sticky Footer)
 * @param roundId - Round ID to fetch comments for
 */
export async function fetchDiscussionData(roundId: number) {
  const [commentsResult, signups] = await Promise.all([
    getCommentsAction({ roundId }, 'asc'),
    getSignupsByRound(roundId),
  ]);

  const comments = commentsResult.success ? commentsResult.comments : [];
  const roundParticipants = signups.map(signup => ({
    userId: signup.userId,
    username: signup.username,
    publicDisplayName: signup.publicDisplayName,
    profilePictureUrl: signup.profilePictureUrl,
  }));

  return {
    comments,
    roundParticipants,
  };
}
