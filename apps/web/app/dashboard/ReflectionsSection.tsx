'use client';

import Link from 'next/link';
import { Badge } from '@eptss/ui';
import { useRouteParams } from '../projects/[projectSlug]/ProjectContext';
import type { Reflection } from '@eptss/data-access';

interface ReflectionsSectionProps {
  reflections: Reflection[];
  roundSlug: string;
}

/**
 * Client component for rendering reflections section
 * Uses useRouteParams() to avoid prop drilling projectSlug
 */
export function ReflectionsSection({ reflections, roundSlug }: ReflectionsSectionProps) {
  const { projectSlug } = useRouteParams();

  return (
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
              href={`/projects/${projectSlug}/reflections/${reflection.slug}`}
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
        <div className="p-3 rounded-lg bg-gray-800/20 border border-gray-700/50">
          <p className="text-xs text-gray-400 text-center">
            No reflections yet.
          </p>
        </div>
      )}
    </div>
  );
}
