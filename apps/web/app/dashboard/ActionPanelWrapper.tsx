import { ActionPanel, ActionPanelData } from '@eptss/dashboard/panels';
import { PanelProps } from '@eptss/dashboard';
import { LateSignupButton } from './LateSignupButton';
import { getAuthUser } from '@eptss/data-access/utils/supabase/server';
import { roundProvider } from '@eptss/data-access';

/**
 * Wrapper around ActionPanel that handles late signup actions
 */
export async function ActionPanelWrapper({ data, config }: PanelProps<ActionPanelData>) {
  if (!data) return null;

  // If this is a late signup action, render custom UI
  if (data.isLateSignup) {
    const { userId } = await getAuthUser();
    const currentRound = await roundProvider();

    if (!userId || !currentRound?.roundId) {
      return null;
    }

    return (
      <div className="relative overflow-hidden rounded-xl p-6 sm:p-8 backdrop-blur-xs border border-gray-800 bg-gray-900/50">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
        
        <div className="relative z-10">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-accent-primary)] mb-2">
              🎯 Your Next Action
            </h2>
            {data.contextMessage && (
              <p className="text-sm sm:text-base text-gray-300">
                {data.contextMessage}
              </p>
            )}
          </div>

          <div className="flex justify-start">
            <LateSignupButton
              roundId={currentRound.roundId}
              userId={userId}
              className="w-full sm:w-auto text-base sm:text-lg font-bold"
            />
          </div>

          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <p className="text-sm text-blue-200">
              <strong>Note:</strong> Since signups have closed, you&apos;ll join without selecting a song. 
              You can still participate in all other round activities!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render the standard ActionPanel
  return <ActionPanel data={data} config={config} />;
}
