import { PanelProps } from '../types';

export type Phase = 'signups' | 'covering' | 'voting' | 'celebration';

export interface CurrentRoundData {
  roundId: number;
  phase: Phase;
  hasSignedUp: boolean;
  hasSubmitted: boolean;
  hasVoted: boolean;
  phaseCloses?: string;
  currentSignups?: number;
  userSongSuggestion?: {
    title: string;
    artist: string;
  };
  userVotes?: Array<{
    title: string;
    artist: string;
    rating: number;
  }>;
}

/**
 * Current Round Panel - Minimalist progress tracker
 * Shows a clean horizontal progress bar with phase status
 */
export function CurrentRoundPanel({ data }: PanelProps<CurrentRoundData>) {
  if (!data) {
    return (
      <div className="w-full p-4 bg-gray-900/30 border border-gray-800 rounded-lg">
        <p className="text-sm text-gray-400">No active round data available.</p>
      </div>
    );
  }

  const {
    phase,
    hasSignedUp,
    hasSubmitted,
    hasVoted,
  } = data;

  const phases = [
    { id: 'signups', label: 'Sign Up', completed: hasSignedUp },
    { id: 'voting', label: 'Vote', completed: hasVoted },
    { id: 'covering', label: 'Cover', completed: hasSubmitted },
    { id: 'celebration', label: 'Listen', completed: phase === 'celebration' },
  ];

  return (
    <div className="w-full p-4 bg-gray-900/30 border border-gray-800 rounded-lg">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-background-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-primary">Your Progress</h3>
      </div>

      {/* Horizontal Progress Bar */}
      <div className="flex items-center gap-2">
        {phases.map((phaseItem, index) => {
          const isCurrent = phaseItem.id === phase;
          const isCompleted = phaseItem.completed;

          return (
            <div key={phaseItem.id} className="flex items-center flex-1">
              {/* Phase Node */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-500 border-green-500'
                      : isCurrent
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/20'
                        : 'border-gray-600 bg-gray-800/50'
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {!isCompleted && isCurrent && (
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium text-center ${
                    isCurrent
                      ? 'text-[var(--color-accent-primary)]'
                      : isCompleted
                        ? 'text-green-400'
                        : 'text-gray-500'
                  }`}
                >
                  {phaseItem.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < phases.length - 1 && (
                <div
                  className={`h-0.5 w-full -mt-5 transition-all ${
                    phases[index + 1].completed || phases[index].completed
                      ? 'bg-green-500'
                      : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CurrentRoundSkeleton() {
  return (
    <div className="w-full p-4 bg-gray-900/30 border border-gray-800 rounded-lg animate-pulse">
      {/* Title skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-gray-700" />
        <div className="h-4 bg-gray-700 rounded w-24" />
      </div>
      {/* Progress bar skeleton */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="w-6 h-6 rounded-full bg-gray-700" />
              <div className="h-3 bg-gray-700 rounded w-10" />
            </div>
            {i < 4 && <div className="h-0.5 w-full bg-gray-700 -mt-5" />}
          </div>
        ))}
      </div>
    </div>
  );
}
