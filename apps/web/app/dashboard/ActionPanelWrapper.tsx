import { ActionPanel, ActionPanelData } from '@eptss/dashboard/panels';
import { PanelProps } from '@eptss/dashboard';
import { LateSignupButton } from './LateSignupButton';
import { InviteScrollButton } from './InviteScrollButton';
import { ReflectionsSection } from './ReflectionsSection';
import { getAuthUser } from '@eptss/core/utils/supabase/server';
import { roundProvider, COVER_PROJECT_ID } from '@eptss/core';
import Link from 'next/link';
import type { Reflection } from '@eptss/core';
import { Button, AlertBox, GradientDivider, Badge } from '@eptss/ui';

export interface ActionPanelWrapperData extends ActionPanelData {
  reflections?: Reflection[];
  roundSlug?: string;
  // Note: projectSlug removed - will be obtained from useRouteParams() in client components
  // Phase status data
  phase?: 'signups' | 'covering' | 'voting' | 'celebration';
  phaseName?: string;
  phaseMessage?: string;
  timeRemaining?: string;
  dueDate?: string;
  urgencyLevel?: 'normal' | 'warning' | 'urgent';
  hasSignedUp?: boolean;
  hasSubmitted?: boolean;
  hasVoted?: boolean;
  showInviteLink?: boolean;
}

/**
 * Wrapper around ActionPanel that combines primary action with reflections
 *
 * Content-only - PanelCard + DashboardLayout handle sizing/styling
 */
export async function ActionPanelWrapper({ data, config }: PanelProps<ActionPanelWrapperData>) {
  if (!data) {
    return null;
  }

  const { reflections = [], roundSlug = '' } = data;

  // If this is a late signup action, render custom UI
  if (data.isLateSignup) {
    const { userId } = await getAuthUser();
    const currentRound = await roundProvider({ projectId: COVER_PROJECT_ID });

    if (!userId || !currentRound?.roundId) {
      return null;
    }

    return (
      <>
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--color-accent-primary)] mb-1.5">
            🎯 Your Next Action
          </h2>
          {data.contextMessage && (
            <p className="text-sm text-gray-300">
              {data.contextMessage}
            </p>
          )}
        </div>

        <div className="flex justify-start mb-3">
          <LateSignupButton
            projectId={COVER_PROJECT_ID}
            roundId={currentRound.roundId}
            userId={userId}
            className="w-full sm:w-auto text-base font-semibold"
          />
        </div>

        <AlertBox variant="info" icon={false} className="p-3">
          <p className="text-xs">
            <strong className="font-semibold">Note:</strong> Since signups have closed, you&apos;ll join without selecting a song.
            You can still participate in all other round activities!
          </p>
        </AlertBox>
      </>
    );
  }

  const {
    phase = 'covering',
    phaseName = 'Current Phase',
    phaseMessage,
    timeRemaining,
    dueDate,
    urgencyLevel = 'normal',
    hasSignedUp = false,
    hasSubmitted = false,
    hasVoted = false,
    showInviteLink = false,
  } = data;

  // Progress phases
  const progressPhases = [
    { id: 'signups', label: 'Sign Up', completed: hasSignedUp },
    { id: 'voting', label: 'Vote', completed: hasVoted },
    { id: 'covering', label: 'Cover', completed: hasSubmitted },
    { id: 'celebration', label: 'Listen', completed: phase === 'celebration' },
  ];

  // Phase icons
  const phaseIcons: Record<string, string> = {
    signups: '📝',
    voting: '🗳️',
    covering: '⏰',
    celebration: '🎉',
  };

  // Urgency styling for countdown
  const urgencyStyles = {
    normal: 'text-[var(--color-accent-primary)]',
    warning: 'text-yellow-400',
    urgent: 'text-red-400',
  };

  // Render action panel with reflections (countdown moved to separate CountdownBar)
  return (
    <div className="space-y-5">
            {/* Primary Action Section */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--color-accent-primary)] mb-1.5">
                🎯 Your Next Action
              </h2>
              {data.contextMessage && (
                <p className="text-sm text-gray-300 mb-3">
                  {data.contextMessage}
                </p>
              )}

              {showInviteLink ? (
                <InviteScrollButton actionText={data.actionText} />
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  asChild
                  className="w-full sm:w-auto gap-2"
                >
                  <Link href={data.actionHref}>
                    <span>{data.actionText}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </Button>
              )}
            </div>

            {/* Divider */}
            <GradientDivider />

            {/* Reflections Section - Client component that uses useRouteParams() */}
            <ReflectionsSection reflections={reflections} roundSlug={roundSlug} />
    </div>
  );
}
