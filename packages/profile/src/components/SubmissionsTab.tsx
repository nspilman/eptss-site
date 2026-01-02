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
                {submission.audio_file_url ? (
                  <AudioPreview
                    src={submission.audio_file_url}
                    title={submission.title || 'Unknown Title'}
                    fileSize={submission.audio_file_size || undefined}
                  />
                ) : submission.soundcloud_url ? (
                  <div className="flex items-center justify-center p-4 bg-[var(--color-background-secondary)] rounded-lg">
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
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </article>
      ))}
    </div>
  );
}
