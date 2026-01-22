"use client";

import Link from "next/link";
import { Playlist, type Track } from "@eptss/media-display";
import { Card, CardContent, Text, Display, Button } from "@eptss/ui";
import { ArrowRight } from "lucide-react";
import type { RoundInfo } from "@eptss/data-access/types/round";

interface PlaylistPageClientProps {
  roundData: RoundInfo;
  roundSlug: string;
}

export function PlaylistPageClient({ roundData, roundSlug }: PlaylistPageClientProps) {
  // Filter submissions that have audio
  const submissionsWithAudio = roundData.submissions.filter(
    (s) => s.audioFileUrl || s.soundcloudUrl
  );

  // Convert submissions to Track format for playlist
  const tracks: Track[] = submissionsWithAudio
    .filter((s) => s.audioFileUrl)
    .map((submission) => {
      const displayName = submission.publicDisplayName || submission.username;
      const submissionId = submission.id || `${submission.roundId}-${submission.userId}`;
      return {
        id: submissionId,
        src: submission.audioFileUrl!,
        title: `${roundData.song?.title || "Cover"} - ${displayName}`,
        artist: displayName,
        duration: submission.audioDuration ? submission.audioDuration / 1000 : undefined,
        fileSize: submission.audioFileSize || undefined,
        coverArt: submission.coverImageUrl || undefined,
        shareUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/share/song/${submissionId}`,
      };
    });

  // Submissions with only SoundCloud links
  const soundcloudSubmissions = submissionsWithAudio.filter(
    (s) => !s.audioFileUrl && s.soundcloudUrl
  );

  const songInfo = roundData.song?.title && roundData.song?.artist
    ? `${roundData.song.title} by ${roundData.song.artist}`
    : `Round ${roundData.roundId}`;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Display size="md" className="mb-2">
            {roundData.song?.title || `Round ${roundData.roundId}`}
          </Display>
          {roundData.song?.artist && (
            <Text size="lg" color="secondary" className="mb-4">
              by {roundData.song.artist}
            </Text>
          )}
          <Text color="tertiary">
            {submissionsWithAudio.length} {submissionsWithAudio.length === 1 ? "cover" : "covers"} submitted
          </Text>
        </div>

        {/* Playlist */}
        {tracks.length > 0 ? (
          <Playlist
            tracks={tracks}
            title={`Round ${roundData.roundId} Covers`}
            description={songInfo}
            showTrackNumbers
            showWaveform
            layout="default"
            maxTrackListHeight={400}
          />
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Text color="secondary">
                No audio files available for this round.
              </Text>
            </CardContent>
          </Card>
        )}

        {/* SoundCloud Links (for legacy submissions) */}
        {soundcloudSubmissions.length > 0 && (
          <div className="mt-8">
            <Text size="lg" weight="medium" className="mb-4">
              Additional Submissions (SoundCloud)
            </Text>
            <div className="grid gap-3">
              {soundcloudSubmissions.map((submission) => (
                <Card key={`${submission.roundId}-${submission.userId}`}>
                  <CardContent className="flex items-center justify-between py-3">
                    <Text>{submission.publicDisplayName || submission.username}</Text>
                    <Button variant="gradient" size="sm" asChild>
                      <a
                        href={submission.soundcloudUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Listen on SoundCloud
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* View Round Link */}
        <div className="flex justify-center mt-8 pt-6 border-t border-[var(--color-gray-700)]">
          <Button variant="secondary" asChild>
            <Link href={`/projects/cover/round/${roundSlug}`}>
              View Full Round Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
