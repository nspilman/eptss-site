'use client';

import { formatDate } from '@eptss/data-access/utils/formatDate';
import { Card, CardContent } from '@eptss/ui';
import { AudioPreview } from '@eptss/media-upload';
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
            <CardContent className="flex flex-col gap-4">
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

              {/* Audio Player */}
              <div className="w-full">
                <AudioPreview
                  src={submission.audio_file_url}
                  title={submission.title || 'Unknown Title'}
                />
              </div>
            </CardContent>
          </Card>
        </article>
      ))}
    </div>
  );
}
