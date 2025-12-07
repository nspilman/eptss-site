import { ActionPanel, ActionPanelData } from '@eptss/dashboard/panels';
import { PanelProps } from '@eptss/dashboard';
import { LateSignupButton } from './LateSignupButton';
import { getAuthUser } from '@eptss/data-access/utils/supabase/server';
import { roundProvider, COVER_PROJECT_ID } from '@eptss/data-access';
import Link from 'next/link';
import type { Reflection } from '@eptss/data-access';
import { Button, AlertBox, GradientDivider, Badge } from '@eptss/ui';

export interface ActionPanelWrapperData extends ActionPanelData {
  reflections?: Reflection[];
  roundSlug?: string;
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
}

/**
 * Wrapper around ActionPanel that combines primary action with reflections
 *
 * Content-only - PanelCard + DashboardLayout handle sizing/styling
 */
export async function ActionPanelWrapper({ data, config }: PanelProps<ActionPanelWrapperData>) {
  if (!data) return null;

  const { reflections = [], roundSlug = '' } = data;

  // If this is a late signup action, render custom UI
  if (data.isLateSignup) {
    const { userId } = await getAuthUser();
    const currentRound = await roundProvider();

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

  // Render unified action panel with reflections and phase status
  return (
    <>
      {/* Countdown Section - Top */}
      {timeRemaining && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className={`w-5 h-5 ${urgencyStyles[urgencyLevel]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className={`text-2xl font-bold ${urgencyStyles[urgencyLevel]} leading-tight`}>
                  {timeRemaining}
                </div>
                {dueDate && (
                  <div className="text-xs text-gray-400">
                    Due: {dueDate}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Dots - Horizontal */}
            <div className="flex items-center gap-3">
              {progressPhases.map((p, index) => {
                const isCurrent = p.id === phase;
                return (
                  <div key={p.id} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        p.completed
                          ? 'bg-[var(--color-accent-secondary)] shadow-sm shadow-[var(--color-accent-secondary)]/50'
                          : isCurrent
                            ? 'bg-[var(--color-accent-primary)] animate-pulse shadow-sm shadow-[var(--color-accent-primary)]/50 scale-110'
                            : 'bg-gray-700'
                      }`}
                    />
                    <span
                      className={`text-xs transition-colors duration-300 ${
                        isCurrent
                          ? 'text-white font-semibold'
                          : p.completed
                            ? 'text-[var(--color-accent-secondary)] font-medium'
                            : 'text-gray-500'
                      }`}
                    >
                      {p.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <GradientDivider />
        </>
      )}

      {/* Actions & Reflections Section */}
      <div className="space-y-4">
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
            </div>

            {/* Divider */}
            <GradientDivider />

            {/* Reflections Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[var(--color-accent-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h3 className="text-base font-semibold text-[var(--color-primary)]">
                  Reflections
                </h3>
                {reflections.length > 0 && (
                  <Badge variant="count">
                    {reflections.length}
                  </Badge>
                )}
              </div>

              {reflections.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {reflections.slice(0, 2).map((reflection) => (
                    <Link
                      key={reflection.id}
                      href={`/reflections/${reflection.slug}`}
                      className="block p-2.5 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 hover:border-[var(--color-accent-secondary)]/50 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-[var(--color-primary)] font-medium truncate">
                          {reflection.title}
                        </span>
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                  {reflections.length > 2 && (
                    <p className="text-xs text-gray-500 text-center pt-0.5">
                      +{reflections.length - 2} more
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-gray-800/20 border border-gray-700/50 mb-3">
                  <p className="text-xs text-gray-400 text-center">
                    No reflections yet. Create your first one!
                  </p>
                </div>
              )}

              <Link
                href={`/round/${roundSlug}/create-reflection`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent-secondary)] hover:text-[var(--color-accent-primary)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Reflection
              </Link>
            </div>
          </div>
    </>
  );
}
