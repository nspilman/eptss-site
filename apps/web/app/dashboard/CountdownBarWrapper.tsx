import type { PanelProps } from "@eptss/dashboard";

import { Text } from "@eptss/ui";
interface CountdownBarData {
  phase: 'signups' | 'voting' | 'covering' | 'celebration';
  timeRemaining?: string;
  dueDate?: string;
  urgencyLevel?: 'normal' | 'warning' | 'urgent';
  hasSignedUp?: boolean;
  hasVoted?: boolean;
  hasSubmitted?: boolean;
  terminology?: {
    phaseShortNames: {
      signups: string;
      voting: string;
      covering: string;
      celebration: string;
    };
  };
}

/**
 * Slim countdown bar showing time remaining and progress through round phases
 *
 * Content-only - PanelCard handles styling
 */
export function CountdownBarWrapper({ data }: PanelProps<CountdownBarData>) {
  if (!data) {
    return null;
  }

  const { phase, timeRemaining, dueDate, urgencyLevel = 'normal', hasSignedUp, hasVoted, hasSubmitted, terminology } = data;

  const urgencyStyles = {
    normal: 'text-[var(--color-accent-primary)]',
    warning: 'text-yellow-400',
    urgent: 'text-red-400',
  };

  // Progress phases with completion status - use terminology if available
  const progressPhases = [
    {
      id: 'signups',
      label: terminology?.phaseShortNames?.signups || 'Sign Up',
      completed: hasSignedUp || false
    },
    {
      id: 'voting',
      label: terminology?.phaseShortNames?.voting || 'Vote',
      completed: hasVoted || false
    },
    {
      id: 'covering',
      label: terminology?.phaseShortNames?.covering || 'Cover',
      completed: hasSubmitted || false
    },
    {
      id: 'celebration',
      label: terminology?.phaseShortNames?.celebration || 'Listen',
      completed: phase === 'celebration'
    },
  ];

  return (
    <div className="flex items-center justify-between py-2">
      {/* Left: Countdown */}
      <div className="flex items-center gap-3">
        <svg className={`w-4 h-4 ${urgencyStyles[urgencyLevel]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex items-center gap-2 text-sm">
          <span className={`font-bold ${urgencyStyles[urgencyLevel]}`}>
            {timeRemaining || 'Starting soon'}
          </span>
          {dueDate && (
            <>
              <Text as="span" className="text-gray-600">·</Text>
              <Text as="span" className="text-gray-400">Due {dueDate}</Text>
            </>
          )}
        </div>
      </div>

      {/* Right: Progress Stepper */}
      <div className="flex items-center gap-4">
        {progressPhases.map((p, index) => {
          const isCurrent = p.id === phase;
          return (
            <div key={p.id} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {/* Dot */}
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    p.completed
                      ? 'bg-[var(--color-accent-secondary)]'
                      : isCurrent
                        ? 'bg-[var(--color-accent-primary)] animate-pulse scale-125'
                        : 'bg-gray-700'
                  }`}
                />
                {/* Label */}
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
              {/* Arrow connector */}
              {index < progressPhases.length - 1 && (
                <svg
                  className={`w-3 h-3 ${
                    p.completed
                      ? 'text-[var(--color-accent-secondary)]/60'
                      : 'text-gray-700'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CountdownBarSkeleton() {
  return (
    <div className="flex items-center justify-between py-2 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
        <div className="h-4 w-32 bg-gray-800 rounded"></div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-3 w-16 bg-gray-800 rounded"></div>
        <div className="h-3 w-16 bg-gray-800 rounded"></div>
        <div className="h-3 w-16 bg-gray-800 rounded"></div>
        <div className="h-3 w-16 bg-gray-800 rounded"></div>
      </div>
    </div>
  );
}
