import { PanelProps } from '../types';
import { Button } from '@eptss/ui';
import Link from 'next/link';

export type UrgencyLevel = 'normal' | 'warning' | 'urgent';

export interface ActionPanelData {
  /** The text to display on the CTA button */
  actionText: string;

  /** The href/route for the action button */
  actionHref: string;

  /** Urgency level affects styling and visual weight */
  urgencyLevel?: UrgencyLevel;

  /** Time remaining display (e.g., "3 days, 5 hours") */
  timeRemaining?: string;

  /** Additional context message shown above the button */
  contextMessage?: string;

  /** Optional icon to show before action text */
  icon?: React.ReactNode;

  /** Whether to show this as a high-priority action */
  isHighPriority?: boolean;
}

/**
 * ActionPanel - Displays the primary call-to-action for the user
 *
 * This panel separates "what to do next" from "current status".
 * It should be placed high in the dashboard (order: 2, right after hero)
 * to ensure users see their next action immediately.
 *
 * Features:
 * - Urgency-based color coding
 * - Time remaining display
 * - Context messaging
 * - High visual prominence
 */
export function ActionPanel({ data }: PanelProps<ActionPanelData>) {
  if (!data) return null;

  const {
    actionText,
    actionHref,
    urgencyLevel = 'normal',
    timeRemaining,
    contextMessage,
    icon,
    isHighPriority = true,
  } = data;

  console.log("ActionPanel data:", data);
  // Color coding based on urgency
  const urgencyStyles = {
    normal: {
      border: 'border-gray-800',
      bg: 'bg-gray-900/50',
      timeColor: 'text-[var(--color-accent-primary)]',
    },
    warning: {
      border: 'border-yellow-600',
      bg: 'bg-yellow-900/10',
      timeColor: 'text-yellow-400',
    },
    urgent: {
      border: 'border-red-600',
      bg: 'bg-red-900/20',
      timeColor: 'text-red-400',
    },
  };

  const styles = urgencyStyles[urgencyLevel];

  return (
    <div
      className={`relative overflow-hidden rounded-xl p-6 sm:p-8 backdrop-blur-xs border ${styles.border} ${styles.bg}`}
    >
      {/* Background pattern for high priority actions */}
      {isHighPriority && (
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
      )}

      <div className="relative z-10">
        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-accent-primary)] mb-2">
            {isHighPriority ? '🎯 ' : ''}Your Next Action
          </h2>
          {contextMessage && (
            <p className="text-sm sm:text-base text-gray-300">
              {contextMessage}
            </p>
          )}
        </div>

        {/* CTA Button */}
        <div className="flex justify-start">
          <Button
            size="lg"
            className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-bold bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900 border-none shadow-lg shadow-[var(--color-accent-primary)] hover:shadow-xl hover:shadow-[var(--color-accent-primary)] transition-all"
            asChild
          >
            <Link href={actionHref} className="inline-flex items-center gap-2">
              {icon}
              <span>{actionText}</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </Button>
        </div>

        {/* Urgency Indicator */}
        {urgencyLevel !== 'normal' && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            {urgencyLevel === 'urgent' && (
              <>
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-red-400 font-medium">
                  Action needed urgently!
                </span>
              </>
            )}
            {urgencyLevel === 'warning' && (
              <>
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-yellow-400 font-medium">
                  Deadline approaching
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ActionPanelSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl p-6 sm:p-8 border border-gray-800 bg-gray-900/50 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="h-8 bg-gray-800 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-800 rounded w-64" />
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
          <div className="h-3 bg-gray-800 rounded w-24 mb-2" />
          <div className="h-6 bg-gray-800 rounded w-20" />
        </div>
      </div>
      <div className="h-14 bg-gray-800 rounded w-full sm:w-48" />
    </div>
  );
}
