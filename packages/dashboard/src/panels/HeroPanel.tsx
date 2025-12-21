import { PanelProps } from '../types';
import { Card, CardContent, Label, Text, AlertBox } from '@eptss/ui';

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
  };
  requirePrompt?: boolean;
  promptText?: string | null;
  projectName?: string;
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
 * Hero Panel - Displays the current round header
 *
 * Content-only component - PanelCard handles all styling
 */
export function HeroPanel({ data }: PanelProps<HeroData>) {
  console.log('[HeroPanel] Rendering with data:', JSON.stringify(data, null, 2));

  if (!data) {
    console.log('[HeroPanel] No data provided');
    return null;
  }

  const { roundId, roundSlug, songTitle, songArtist, currentPhase, terminology, requirePrompt, promptText, projectName } = data;

  console.log('[HeroPanel] Extracted terminology:', JSON.stringify(terminology, null, 2));
  console.log('[HeroPanel] Current phase:', currentPhase);
  console.log('[HeroPanel] Round slug:', roundSlug);

  // Format round title based on terminology
  const formatRoundTitle = () => {
    console.log('[HeroPanel] formatRoundTitle - useRoundNumber:', terminology?.useRoundNumber, 'roundPrefix:', terminology?.roundPrefix, 'roundFormat:', terminology?.roundFormat);

    if (terminology?.useRoundNumber) {
      const prefix = terminology.roundPrefix ? `${terminology.roundPrefix} ` : '';
      const title = `${prefix}${roundId}`;
      console.log('[HeroPanel] formatRoundTitle (with number):', title);
      return title;
    }

    // For month format, parse the slug to show "Month Year"
    if (terminology?.roundFormat === 'month' && roundSlug) {
      const monthTitle = parseMonthFromSlug(roundSlug);
      if (monthTitle) {
        console.log('[HeroPanel] formatRoundTitle (month format):', monthTitle);
        return monthTitle;
      }
    }

    // For custom format or if prefix is explicitly set, use the prefix
    // Check for undefined, not falsy, to allow empty strings
    const title = terminology?.roundPrefix !== undefined ? terminology.roundPrefix : `Round ${roundId}`;
    console.log('[HeroPanel] formatRoundTitle (custom/prefix):', title);
    return title;
  };

  // Format status message based on terminology
  const formatStatus = () => {
    if (songTitle && songArtist) {
      const status = `${songTitle} by ${songArtist}`;
      console.log('[HeroPanel] formatStatus (with song):', status);
      return status;
    }
    // Use current phase name from terminology, fallback to signups if no phase provided
    const phase = currentPhase || 'signups';
    const status = terminology?.phases?.[phase] || 'Song Selection in Progress';
    console.log('[HeroPanel] formatStatus (no song):', status, 'from terminology.phases.' + phase + ':', terminology?.phases?.[phase]);
    return status;
  };

  const roundTitle = formatRoundTitle();
  const status = formatStatus();

  // Build the full title with project name
  let fullTitle = '';
  if (projectName) {
    fullTitle = `${projectName} - `;
  }
  if (roundTitle) {
    fullTitle += `${roundTitle}: `;
  }
  fullTitle += status;

  console.log('[HeroPanel] Final render:', fullTitle);

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold">
        <span className="bg-clip-text text-transparent bg-linear-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
          {fullTitle}
        </span>
      </h1>

      {/* Display prompt if this project requires prompts */}
      {requirePrompt && (
        <Card variant="glass">
          <CardContent>
            {promptText ? (
              <div className="space-y-2">
                <Label size="sm" color="secondary" className="uppercase tracking-wide">
                  This Month's Prompt
                </Label>
                <Text size="lg" color="primary">
                  {promptText}
                </Text>
              </div>
            ) : (
              <AlertBox
                variant="warning"
                title="Round Prompt Locked"
                className="mt-2"
              >
                <Text size="sm" color="secondary">
                  Prompt will be revealed when the round begins. Keep an eye on this space when the round starts.
                </Text>
              </AlertBox>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-800 rounded w-3/4" />
    </div>
  );
}
