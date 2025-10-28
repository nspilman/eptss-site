import { PanelProps } from '../types';
import { Card } from '@eptss/ui';

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
 * Current Round Panel - Shows round progress and status
 * Priority: primary (main content)
 *
 * This panel focuses on STATUS ONLY (no CTAs).
 * CTAs are handled by the separate ActionPanel.
 *
 * Shows:
 * - Current phase
 * - Phase completion checkmarks
 * - User's song suggestion (if in signup phase)
 * - User's votes (if in voting phase)
 * - Additional phase-specific info
 */
export function CurrentRoundPanel({ data }: PanelProps<CurrentRoundData>) {
  if (!data) {
    return (
      <Card className="w-full p-8 bg-gray-900/50 border-gray-800">
        <p className="text-secondary">No active round data available.</p>
      </Card>
    );
  }

  const {
    phase,
    hasSignedUp,
    hasSubmitted,
    hasVoted,
    currentSignups,
    userSongSuggestion,
    userVotes,
  } = data;

  return (
    <Card className="w-full p-8 bg-gray-900/50 border-gray-800 relative overflow-hidden backdrop-blur-xs">
      <h2 className="text-2xl font-semibold mb-6 text-primary">
        Your Progress
      </h2>

      {/* Phase Progress Indicators */}
      <div className="space-y-4 mb-6">
        <PhaseIndicator
          phase="signups"
          currentPhase={phase}
          completed={hasSignedUp}
          label="Sign Up & Suggest Songs"
        />
        <PhaseIndicator
          phase="voting"
          currentPhase={phase}
          completed={hasVoted}
          label="Vote on Song Selection"
        />
        <PhaseIndicator
          phase="covering"
          currentPhase={phase}
          completed={hasSubmitted}
          label="Work on Your Cover"
        />
        <PhaseIndicator
          phase="celebration"
          currentPhase={phase}
          completed={phase === 'celebration'}
          label="Listening Party"
        />
      </div>

      {/* Additional Info Section */}
      <div className="space-y-4">
        {/* Signup Phase Info */}
        {phase === 'signups' && (
          <div className="p-4 rounded-lg bg-background-secondary border border-accent-secondary">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-primary">Signup Phase</h3>
              {currentSignups !== undefined && (
                <span className="text-sm text-gray-400">
                  {currentSignups} {currentSignups === 1 ? 'signup' : 'signups'}
                </span>
              )}
            </div>
            {hasSignedUp && userSongSuggestion ? (
              <>
                <p className="text-sm text-gray-400 mb-2">Your song suggestion:</p>
                <p className="text-accent-primary font-medium">
                  {userSongSuggestion.title} by {userSongSuggestion.artist}
                </p>
              </>
            ) : hasSignedUp ? (
              <p className="text-gray-400">You've signed up for this round!</p>
            ) : (
              <p className="text-gray-400">
                Sign up and suggest a song for everyone to cover.
              </p>
            )}
          </div>
        )}

        {/* Voting Phase Info */}
        {phase === 'voting' && hasSignedUp && (
          <div className="p-4 rounded-lg bg-background-secondary border border-accent-secondary">
            <h3 className="text-lg font-medium text-primary mb-2">
              Voting Phase
            </h3>
            {hasVoted && userVotes && userVotes.length > 0 ? (
              <>
                <p className="text-green-400 mb-3">
                  ✓ You've voted on {userVotes.length}{' '}
                  {userVotes.length === 1 ? 'song' : 'songs'}
                </p>
                <div className="space-y-2">
                  {userVotes.map((vote, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-300">
                        {vote.title} by {vote.artist}
                      </span>
                      <span className="text-[var(--color-accent-primary)] font-medium">
                        {vote.rating}/5
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-400">
                Vote on which song suggestions should be covered this round!
              </p>
            )}
          </div>
        )}

        {/* Covering Phase Info */}
        {phase === 'covering' && (
          <div className="p-4 rounded-lg bg-background-secondary border border-accent-secondary">
            <h3 className="text-lg font-medium text-primary mb-2">
              Covering Phase
            </h3>
            {hasSubmitted ? (
              <p className="text-green-400">
                ✓ You've submitted your cover! Great work!
              </p>
            ) : hasSignedUp ? (
              <p className="text-gray-400">
                Time to record and submit your cover of the selected song.
              </p>
            ) : (
              <p className="text-gray-400">
                You didn't sign up for this round, but you can join the next one!
              </p>
            )}
          </div>
        )}

        {/* Celebration Phase Info */}
        {phase === 'celebration' && (
          <div className="p-4 rounded-lg bg-background-secondary border border-accent-secondary">
            <h3 className="text-lg font-medium text-primary mb-2">
              🎉 Listening Party!
            </h3>
            <p className="text-gray-400">
              Join us for the listening party event to celebrate this round and hear all the covers!
            </p>
          </div>
        )}

        {/* Not Participating Message */}
        {!hasSignedUp && phase !== 'celebration' && (
          <div className="p-4 rounded-lg bg-background-tertiary border border-accent-tertiary">
            <h3 className="text-lg font-medium text-primary mb-2">
              Not Participating Yet
            </h3>
            <p className="text-gray-400">
              {phase === 'signups'
                ? "You haven't signed up for this round yet. Use the action panel above to join!"
                : phase === 'covering'
                  ? "The signup phase has ended, but you can join the next round!"
                  : "You're not participating in this round, but you can join the next one!"}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

interface PhaseIndicatorProps {
  phase: string;
  currentPhase: string;
  completed: boolean;
  label: string;
}

function PhaseIndicator({
  phase,
  currentPhase,
  completed,
  label,
}: PhaseIndicatorProps) {
  const isCurrent = phase === currentPhase;

  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
          completed
            ? 'bg-green-500 border-green-500'
            : isCurrent
              ? 'border-[var(--color-accent-primary)] ring-2 ring-[var(--color-accent-primary)] ring-opacity-30'
              : 'border-gray-600'
        }`}
      >
        {completed && (
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {!completed && isCurrent && (
          <div className="w-3 h-3 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
        )}
      </div>
      <div className="flex-1">
        <span
          className={`text-sm font-medium ${
            isCurrent
              ? 'text-[var(--color-accent-primary)]'
              : completed
                ? 'text-green-400'
                : 'text-gray-400'
          }`}
        >
          {label}
        </span>
        {isCurrent && (
          <span className="ml-2 text-xs text-[var(--color-accent-primary)] font-medium">
            ← You are here
          </span>
        )}
      </div>
    </div>
  );
}

export function CurrentRoundSkeleton() {
  return (
    <Card className="w-full p-8 bg-gray-900/50 border-gray-800 animate-pulse">
      <div className="h-8 bg-gray-800 rounded w-1/3 mb-6" />
      <div className="space-y-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-800" />
            <div className="h-4 bg-gray-800 rounded w-48" />
          </div>
        ))}
      </div>
      <div className="p-4 rounded-lg bg-gray-800/50">
        <div className="h-6 bg-gray-800 rounded w-32 mb-2" />
        <div className="h-4 bg-gray-800 rounded w-full" />
      </div>
    </Card>
  );
}
