'use client';

import { formatDate } from '@eptss/data-access/utils/formatDate';
import { Card, CardContent, Text, Heading } from '@eptss/ui';
import { AudioPreview } from '@eptss/media-upload';
import type { Submission } from '../types';

interface SubmissionsTabProps {
  submissions: Submission[];
}

export function SubmissionsTab({ submissions }: SubmissionsTabProps) {
  if (submissions.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <Text size="lg" color="secondary">
          You haven&apos;t submitted any songs yet.
        </Text>
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
                <Heading as="h3" size="xs" className="mb-1">
                  {submission.title || 'Unknown Title'}
                </Heading>
                <Text size="sm" color="tertiary" className="mb-2">
                  by {submission.artist || 'Unknown Artist'}
                </Text>
                {submission.created_at && (
                  <Text size="xs" color="secondary">
                    Submitted {formatDate(submission.created_at)}
                  </Text>
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
