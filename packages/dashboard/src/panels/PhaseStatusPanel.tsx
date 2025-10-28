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
}

/**
 * PhaseStatusPanel - Displays current phase and deadline
 * 
 * Shows phase information and time remaining in a prominent banner.
 * Separate from ActionPanel to decouple deadline visibility from CTAs.
 * 
 * Priority: primary (order: 2, right after hero)
 */
export function PhaseStatusPanel({ data }: PanelProps<PhaseStatusData>) {
  if (!data) return null;

  const { phase, timeRemaining, urgencyLevel = 'normal', message } = data;

  // Phase display names
  const phaseNames: Record<Phase, string> = {
    signups: 'Song Selection & Signups',
    voting: 'Voting Phase',
    covering: 'Covering Phase',
    celebration: 'Listening Party',
  };

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

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-6 backdrop-blur-xs border ${styles.border} ${styles.bg}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Phase Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{styles.icon}</span>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-primary)]">
              {phaseNames[phase]}
            </h2>
          </div>
          {message && (
            <p className="text-sm text-gray-300 mt-1">
              {message}
            </p>
          )}
        </div>

        {/* Time Remaining */}
        {timeRemaining && (
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 min-w-[200px]">
            <p className="text-xs text-gray-400 mb-1">
              Time Remaining
            </p>
            <p className={`text-2xl font-bold ${styles.timeColor}`}>
              {timeRemaining}
            </p>
            {urgencyLevel === 'urgent' && (
              <p className="text-xs text-red-400 mt-1 font-medium">
                Deadline approaching!
              </p>
            )}
            {urgencyLevel === 'warning' && (
              <p className="text-xs text-yellow-400 mt-1 font-medium">
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
