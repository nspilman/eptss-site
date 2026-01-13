"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@eptss/data-access/utils/formatDate";
import { AudioPreview, AudioPreviewErrorBoundary } from "@eptss/media-display";
import { Card, CardContent, Text, Display, Button } from "@eptss/ui";
import { ArrowRight } from "lucide-react";
import type { SubmissionDetails } from "@eptss/data-access";

interface SongPageClientProps {
  submission: SubmissionDetails;
}

export function SongPageClient({ submission }: SongPageClientProps) {
  const displayName = submission.publicDisplayName || submission.username;

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card gradient>
          <CardContent className="flex flex-col gap-6">
            {/* Header with cover art and info */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Cover Art */}
              {submission.coverImageUrl ? (
                <div className="relative w-full md:w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={submission.coverImageUrl}
                    alt={`Cover art for ${displayName}'s submission`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : submission.profilePictureUrl ? (
                <div className="relative w-full md:w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={submission.profilePictureUrl}
                    alt={`${displayName}'s profile picture`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : null}

              {/* Song Info */}
              <div className="flex-1">
                {submission.songTitle && submission.songArtist && (
                  <>
                    <Display size="sm" className="mb-2">
                      {submission.songTitle}
                    </Display>
                    <Text size="lg" color="secondary" className="mb-4">
                      by {submission.songArtist}
                    </Text>
                  </>
                )}

                <div className="flex items-center gap-3 mb-2">
                  {submission.profilePictureUrl && !submission.coverImageUrl && (
                    <img
                      src={submission.profilePictureUrl}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[var(--color-accent-primary)]"
                    />
                  )}
                  <div>
                    <Text size="sm" color="tertiary">
                      Covered by
                    </Text>
                    <Link
                      href={`/profile/${submission.username}`}
                      className="text-[var(--color-accent-primary)] hover:underline font-medium"
                    >
                      {displayName}
                    </Link>
                  </div>
                </div>

                {submission.createdAt && (
                  <Text size="xs" color="secondary">
                    Submitted {formatDate(submission.createdAt.toISOString())}
                  </Text>
                )}

                {submission.roundSlug && (
                  <Link
                    href={`/projects/cover/round/${submission.roundSlug}`}
                    className="inline-block mt-2 text-sm text-[var(--color-accent-secondary)] hover:underline"
                  >
                    View Round
                  </Link>
                )}
              </div>
            </div>

            {/* Audio Player */}
            <div className="w-full">
              {submission.audioFileUrl ? (
                <AudioPreviewErrorBoundary>
                  <AudioPreview
                    src={submission.audioFileUrl}
                    title={submission.songTitle || "Cover"}
                    fileSize={submission.audioFileSize || undefined}
                  />
                </AudioPreviewErrorBoundary>
              ) : submission.soundcloudUrl ? (
                <div className="flex items-center justify-center p-4 bg-[var(--color-background-secondary)] rounded-lg">
                  <Button variant="gradient" asChild>
                    <a
                      href={submission.soundcloudUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 6.5L16 12L7 17.5V6.5Z"/>
                      </svg>
                      Listen on SoundCloud
                    </a>
                  </Button>
                </div>
              ) : (
                <Text color="secondary" className="text-center py-4">
                  No audio available
                </Text>
              )}
            </div>

            {/* View Profile Link */}
            <div className="flex justify-center pt-4 border-t border-[var(--color-gray-700)]">
              <Button variant="secondary" asChild>
                <Link href={`/profile/${submission.username}`}>
                  View {displayName}&apos;s Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
