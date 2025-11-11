import { PanelProps } from '../types';

export type Phase = 'signups' | 'covering' | 'voting' | 'celebration';
export type UrgencyLevel = 'normal' | 'warning' | 'urgent';

export interface PhaseStatusData {
  /** Current phase name */
  phase: Phase;

  /** Time remaining display (e.g., "3 days, 5 hours") */
  timeRemaining?: string;

  /** Urgency level affects styling */
  urgencyLevel?: UrgencyLevel;

  /** Optional phase-specific message */
  message?: string;

  /** Progress tracking */
  hasSignedUp?: boolean;
  hasSubmitted?: boolean;
  hasVoted?: boolean;
}

/**
 * PhaseStatusPanel - Displays current phase, deadline, and progress
 *
 * Combines phase status and progress tracking in one minimal component.
 *
 * Priority: primary (order: 2, right after hero)
 */
export function PhaseStatusPanel({ data }: PanelProps<PhaseStatusData>) {
  if (!data) return null;

  const {
    phase,
    timeRemaining,
    urgencyLevel = 'normal',
    message,
    hasSignedUp = false,
    hasSubmitted = false,
    hasVoted = false,
  } = data;

  // Phase display names
  const phaseNames: Record<Phase, string> = {
    signups: 'Song Selection & Signups',
    voting: 'Voting Phase',
    covering: 'Covering Phase',
    celebration: 'Listening Party',
  };

  // Progress phases
  const progressPhases = [
    { id: 'signups', completed: hasSignedUp },
    { id: 'voting', completed: hasVoted },
    { id: 'covering', completed: hasSubmitted },
    { id: 'celebration', completed: phase === 'celebration' },
  ];

  // Urgency styling
  const urgencyStyles = {
    normal: {
      border: 'border-gray-800',
      bg: 'bg-gray-900/50',
      timeColor: 'text-[var(--color-accent-primary)]',
      icon: '⏰',
    },
    warning: {
      border: 'border-yellow-600',
      bg: 'bg-yellow-900/10',
      timeColor: 'text-yellow-400',
      icon: '⚠️',
    },
    urgent: {
      border: 'border-red-600',
      bg: 'bg-red-900/20',
      timeColor: 'text-red-400',
      icon: '🚨',
    },
  };

  const styles = urgencyStyles[urgencyLevel];

  const phaseLabels = ['Sign Up', 'Vote', 'Cover', 'Listen'];

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-6 backdrop-blur-xs border ${styles.border} ${styles.bg}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        {/* Phase Info */}
        <div className="flex-1 space-y-4">
          {/* Title */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl leading-none">{styles.icon}</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-primary)]">
                {phaseNames[phase]}
              </h2>
            </div>
            {message && (
              <p className="text-sm text-gray-300 leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {/* Refined Progress Indicator */}
          <div className="flex items-center gap-3">
            {progressPhases.map((p, index) => {
              const isCurrent = p.id === phase;
              return (
                <div key={p.id} className="flex flex-col items-center gap-1.5">
                  {/* Dot */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      p.completed
                        ? 'bg-[var(--color-accent-secondary)] shadow-sm shadow-[var(--color-accent-secondary)]/50'
                        : isCurrent
                          ? 'bg-[var(--color-accent-primary)] animate-pulse shadow-sm shadow-[var(--color-accent-primary)]/50 scale-110'
                          : 'bg-gray-700'
                    }`}
                  />
                  {/* Label */}
                  <span
                    className={`text-[10px] transition-colors duration-300 ${
                      isCurrent
                        ? 'text-white font-semibold'
                        : p.completed
                          ? 'text-[var(--color-accent-secondary)] font-medium'
                          : 'text-gray-500 font-medium'
                    }`}
                  >
                    {phaseLabels[index]}
                  </span>
                  {/* Connector Line */}
                  {index < progressPhases.length - 1 && (
                    <div
                      className={`absolute h-0.5 w-3 translate-x-[18px] -translate-y-[11px] transition-colors duration-300 ${
                        progressPhases[index + 1].completed || p.completed
                          ? 'bg-[var(--color-accent-secondary)]/60'
                          : 'bg-gray-700/50'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Remaining */}
        {timeRemaining && (
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 min-w-[180px] sm:min-w-[200px] self-start">
            <p className="text-xs text-gray-400 mb-1.5 font-medium">
              Time Remaining
            </p>
            <p className={`text-2xl font-bold ${styles.timeColor} leading-tight`}>
              {timeRemaining}
            </p>
            {urgencyLevel === 'urgent' && (
              <p className="text-xs text-red-400 mt-2 font-medium">
                Deadline approaching!
              </p>
            )}
            {urgencyLevel === 'warning' && (
              <p className="text-xs text-yellow-400 mt-2 font-medium">
                Less than 3 days left
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function PhaseStatusSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl p-6 border border-gray-800 bg-gray-900/50 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="h-8 bg-gray-800 rounded w-64 mb-2" />
          <div className="h-4 bg-gray-800 rounded w-48" />
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 min-w-[200px]">
          <div className="h-3 bg-gray-800 rounded w-24 mb-2" />
          <div className="h-8 bg-gray-800 rounded w-32" />
        </div>
      </div>
    </div>
  );
}
