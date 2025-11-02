'use client';

import { formatDate } from '@eptss/data-access/utils/formatDate';
import { Card, CardContent } from '@eptss/ui';
import type { Submission } from '../types';

interface SubmissionsTabProps {
  submissions: Submission[];
}

export function SubmissionsTab({ submissions }: SubmissionsTabProps) {
  if (submissions.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <p className="text-[var(--color-gray-400)] text-lg font-roboto">
          You haven&apos;t submitted any songs yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 w-full">
      {submissions.map((submission) => (
        <article
          key={submission.id}
          className="relative group transition-all duration-300"
        >
          {/* Gradient border effect */}
          <div className="absolute -inset-1 bg-[var(--color-gradient-primary)] rounded-2xl blur-sm opacity-15 group-hover:opacity-35 group-hover:blur-lg transition duration-500"></div>

          {/* Card content */}
          <Card className="relative group-hover:shadow-xl transition-shadow duration-300">
            <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold font-fraunces text-[var(--color-primary)] mb-1">
                  {submission.title || 'Unknown Title'}
                </h3>
                <p className="text-sm text-[var(--color-gray-300)] font-roboto mb-2">
                  by {submission.artist || 'Unknown Artist'}
                </p>
                {submission.created_at && (
                  <p className="text-xs text-[var(--color-gray-400)] font-roboto">
                    Submitted {formatDate(submission.created_at)}
                  </p>
                )}
              </div>
              {submission.soundcloud_url && (
                <a
                  href={submission.soundcloud_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] text-black font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 6.5L16 12L7 17.5V6.5Z"/>
                  </svg>
                  Listen on SoundCloud
                </a>
              )}
            </CardContent>
          </Card>
        </article>
      ))}
    </div>
  );
}
