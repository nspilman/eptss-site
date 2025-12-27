import { PanelProps } from '../types';
import { Check, Clock, Send } from 'lucide-react';
import { Badge, Card, CardContent, Display, Text, Label, Heading, Button } from '@eptss/ui';

interface HeroData {
  roundId: number;
  roundSlug?: string;
  songTitle?: string;
  songArtist?: string;
  currentPhase?: 'signups' | 'voting' | 'covering' | 'celebration';
  terminology?: {
    roundPrefix: string;
    useRoundNumber: boolean;
    roundFormat: 'number' | 'month' | 'custom';
    phases: {
      signups: string;
      voting: string;
      covering: string;
      celebration: string;
    };
    phaseShortNames?: {
      signups: string;
      voting: string;
      covering: string;
      celebration: string;
    };
  };
  requirePrompt?: boolean;
  promptText?: string | null;
  projectName?: string;
  projectSlug?: string;
  // Countdown/deadline info
  timeRemaining?: string;
  dueDate?: string;
  urgencyLevel?: 'normal' | 'warning' | 'urgent';
  // User progress
  hasSignedUp?: boolean;
  hasVoted?: boolean;
  hasSubmitted?: boolean;
}

/**
 * Helper to parse round slug into month name and year
 * Expects slug format: "YYYY-MM-DD" (e.g., "2026-01-01")
 * Returns: "Month Year" (e.g., "January 2026")
 */
function parseMonthFromSlug(slug: string): string {
  try {
    const [year, month] = slug.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
    return `${monthName} ${year}`;
  } catch (error) {
    console.warn('[HeroPanel] Failed to parse month from slug:', slug, error);
    return '';
  }
}

/**
 * Hero Panel - Displays the current round header with clean card design
 *
 * Content-only component - PanelCard handles all styling
 */
export function HeroPanel({ data }: PanelProps<HeroData>) {
  if (!data) {
    return null;
  }

  const {
    roundId,
    roundSlug,
    songTitle,
    songArtist,
    currentPhase = 'signups',
    terminology,
    requirePrompt,
    promptText,
    projectSlug,
    timeRemaining,
    dueDate,
    urgencyLevel = 'normal',
    hasSignedUp,
    hasVoted,
    hasSubmitted,
  } = data;

  // Format round title based on terminology
  const formatRoundTitle = () => {
    if (terminology?.useRoundNumber) {
      const prefix = terminology.roundPrefix ? `${terminology.roundPrefix} ` : '';
      return `${prefix}${roundId}`;
    }

    if (terminology?.roundFormat === 'month' && roundSlug) {
      const monthTitle = parseMonthFromSlug(roundSlug);
      if (monthTitle) return monthTitle;
    }

    return terminology?.roundPrefix !== undefined ? terminology.roundPrefix : `Round ${roundId}`;
  };

  const roundTitle = formatRoundTitle();
  const phaseLabel = terminology?.phases?.[currentPhase] || currentPhase;

  // Determine deadline label based on current phase
  const getDeadlineLabel = () => {
    switch (currentPhase) {
      case 'signups':
        return 'Signup Deadline';
      case 'voting':
        return 'Voting Deadline';
      case 'covering':
        return 'Submission Deadline';
      case 'celebration':
        return 'Celebration Date';
      default:
        return 'Deadline';
    }
  };

  // Progress phases
  const progressPhases = [
    {
      id: 'signups',
      label: terminology?.phaseShortNames?.signups || 'Sign Up',
      completed: hasSignedUp || false,
    },
    {
      id: 'voting',
      label: terminology?.phaseShortNames?.voting || 'Vote',
      completed: hasVoted || false,
    },
    {
      id: 'covering',
      label: terminology?.phaseShortNames?.covering || 'Cover',
      completed: hasSubmitted || false,
    },
    {
      id: 'celebration',
      label: terminology?.phaseShortNames?.celebration || 'Listen',
      completed: currentPhase === 'celebration',
    },
  ];

  const currentPhaseIndex = progressPhases.findIndex(p => p.id === currentPhase);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Top Content Group */}
      <div className="space-y-6">
        {/* Top Badges and Submit Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
              {roundTitle}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 text-sm">
              {phaseLabel}
            </Badge>
          </div>

          {projectSlug && roundSlug && currentPhase === 'covering' && (
            <Button variant="secondary" size="md" asChild>
              <a href={`/projects/${projectSlug}/submit`}>
                <Send className="w-4 h-4 mr-2" />
                Submit Cover
              </a>
            </Button>
          )}
        </div>

        {/* Song Title */}
        {songTitle && (
          <div>
            <Display size="md" gradient className="mb-2">
              {songTitle}
            </Display>
            {songArtist && (
              <Text size="lg" color="secondary" as="p">
                by {songArtist}
              </Text>
            )}
          </div>
        )}

        {/* Progress Stepper */}
        <div className="flex items-center justify-start gap-0">
          {progressPhases.map((phase, index) => {
            const isCurrent = index === currentPhaseIndex;
            const isCompleted = phase.completed;
            const stepNumber = index + 1;

            return (
              <div key={phase.id} className="flex items-center">
                {/* Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                      isCompleted
                        ? 'bg-[var(--color-accent-primary)] border-2 border-[var(--color-accent-primary)] text-[var(--color-background-primary)]'
                        : isCurrent
                        ? 'bg-[var(--color-accent-primary)] border-2 border-[var(--color-accent-primary)] text-[var(--color-background-primary)]'
                        : 'bg-[var(--color-gray-800)] border-2 border-[var(--color-gray-700)] text-[var(--color-gray-400)]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                  </div>
                  <Label
                    size="sm"
                    color={isCurrent || isCompleted ? 'primary' : 'secondary'}
                    className="mt-2"
                    as="span"
                  >
                    {phase.label}
                  </Label>
                </div>

                {/* Connector Line */}
                {index < progressPhases.length - 1 && (
                  <div
                    className={`h-0.5 w-16 mx-2 mb-6 ${
                      isCompleted ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-gray-700)]'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Content Group - pushed to bottom */}
      <div className="mt-auto space-y-6">
        {/* Deadline Section */}
        {timeRemaining && dueDate && (
          <div className="flex items-start gap-3 p-4 bg-[var(--color-gray-900)]/40 border border-[var(--color-gray-800)] rounded-lg">
            <Clock className="w-5 h-5 text-[var(--color-accent-primary)] mt-0.5" />
            <div>
              <Text size="sm" color="primary" weight="medium" as="p">
                {getDeadlineLabel()}
              </Text>
              <Label size="xs" color="secondary" as="p">
                {dueDate}
              </Label>
            </div>
            <div className="ml-auto text-right">
              <Text
                size="xl"
                weight="bold"
                color={
                  urgencyLevel === 'urgent' ? 'destructive' :
                  urgencyLevel === 'warning' ? 'accent-secondary' :
                  'accent'
                }
                className="text-3xl"
                as="p"
              >
                {timeRemaining.split(',')[0]}
              </Text>
              <Text size="sm" color="secondary" as="p">
                days left
              </Text>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {projectSlug && roundSlug && (
        <div className="grid grid-cols-2 gap-4">
          <a
            href={`/projects/${projectSlug}/round/${roundSlug}/create-reflection`}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-gray-900)]/60 border border-[var(--color-gray-800)] hover:bg-[var(--color-accent-primary)]/10 hover:border-[var(--color-accent-primary)] text-[var(--color-primary)] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Share Your Reflection
          </a>
          <a
            href="#discussion"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-gray-900)]/60 border border-[var(--color-gray-800)] hover:bg-[var(--color-accent-primary)]/10 hover:border-[var(--color-accent-primary)] text-[var(--color-primary)] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Join Discussion
          </a>
        </div>
      )}

        {/* Display prompt if this project requires prompts */}
        {requirePrompt && (
          <Card>
            <CardContent>
              {promptText ? (
                <div className="space-y-2">
                  <Label size="xs" color="secondary" className="uppercase tracking-wide" as="p">
                    This Month's Prompt
                  </Label>
                  <Text size="lg" color="primary" as="p">
                    {promptText}
                  </Text>
                </div>
              ) : (
                <div className="border border-[var(--color-accent-secondary)]/40 bg-[var(--color-accent-secondary)]/10 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[var(--color-accent-secondary)] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <Heading size="xs" className="text-[var(--color-accent-secondary)] mb-1" as="h4">
                        Round Prompt Locked
                      </Heading>
                      <Text size="sm" color="secondary" as="p">
                        Prompt will be revealed when the round begins. Keep an eye on this space when the round starts.
                      </Text>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-[var(--color-gray-800)] rounded w-3/4" />
    </div>
  );
}
