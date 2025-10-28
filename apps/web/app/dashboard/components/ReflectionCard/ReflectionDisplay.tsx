'use client';

import Link from 'next/link';
import type { Reflection } from '@eptss/data-access';

interface ReflectionDisplayProps {
  roundSlug: string;
  reflections: Reflection[];
}

export function ReflectionDisplay({ roundSlug, reflections }: ReflectionDisplayProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-[var(--color-background-secondary)] rounded-lg border border-[var(--color-gray-800)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-1">
              My Reflections
            </h2>
            <p className="text-sm text-[var(--color-gray-400)]">
              Your reflections for this round
            </p>
          </div>
        </div>

        {reflections.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-400 mb-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{reflections.length} {reflections.length === 1 ? 'reflection' : 'reflections'}</span>
            </div>

            <div className="space-y-3">
              {reflections.map((reflection) => (
                <div key={reflection.id} className="p-4 bg-[var(--color-gray-900-40)] rounded-lg border border-[var(--color-gray-800)] hover:border-[var(--color-accent-primary)] transition-colors">
                  <h3 className="font-semibold text-[var(--color-primary)] mb-2">
                    {reflection.title}
                  </h3>
                  <p className="text-sm text-[var(--color-gray-400)] mb-3">
                    Created {new Date(reflection.createdAt).toLocaleDateString()}
                  </p>
                  <Link
                    href={`/reflections/${reflection.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] transition-colors"
                  >
                    View reflection
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>

            <Link
              href={`/round/${roundSlug}/create-reflection`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-primary)] text-white font-medium rounded-lg hover:bg-[var(--color-accent-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-background-secondary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Reflection
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[var(--color-gray-300)]">
              Start your journey by reflecting on your goals, expectations, and approach for this round.
            </p>

            <Link
              href={`/round/${roundSlug}/create-reflection`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-primary)] text-black font-medium rounded-lg hover:bg-[var(--color-accent-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-background-secondary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Initial Reflection
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
