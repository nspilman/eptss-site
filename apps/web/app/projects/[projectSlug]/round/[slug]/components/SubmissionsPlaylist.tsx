"use client";

import Link from "next/link";
import { Playlist, type Track } from "@eptss/media-display";
import { Card, CardContent, Text, SectionHeader, Button } from "@eptss/ui";
import { Play } from "lucide-react";
import type { Submission } from "@eptss/data-access/types/round";

interface SubmissionsPlaylistProps {
  submissions: Submission[];
  song: { title: string; artist: string } | null;
  roundId: number;
  roundSlug: string;
}

export const SubmissionsPlaylist = ({
  submissions,
  song,
  roundId,
  roundSlug
}: SubmissionsPlaylistProps) => {
  // Filter submissions that have audio
  const submissionsWithAudio = submissions.filter(
    (s) => s.audioFileUrl || s.soundcloudUrl
  );

  if (submissionsWithAudio.length === 0) {
    return null;
  }

  // Convert submissions to Track format for playlist
  const tracks: Track[] = submissionsWithAudio
    .filter((s) => s.audioFileUrl) // Only include direct audio files in playlist
    .map((submission) => {
      const displayName = submission.publicDisplayName || submission.username;
      const submissionId = `${submission.roundId}-${submission.userId}`;
      return {
        id: submissionId,
        src: submission.audioFileUrl!,
        title: song?.title ? `${song.title} - ${displayName}` : displayName,
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

  const songInfo = song?.title && song?.artist
    ? `${song.title} by ${song.artist}`
    : `Round ${roundId}`;

  return (
    <section className="w-full max-w-4xl mx-auto my-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="Community Covers" />
        <Link
          href={`/share/playlist/${roundSlug}`}
          className="text-sm text-[var(--color-accent-primary)] hover:underline"
        >
          Share Playlist
        </Link>
      </div>

      {/* Playlist */}
      {tracks.length > 0 ? (
        <Playlist
          tracks={tracks}
          title={`Round ${roundId} Covers`}
          description={songInfo}
          showTrackNumbers
          showWaveform
          layout="default"
          maxTrackListHeight={300}
        />
      ) : null}

      {/* SoundCloud Links (for legacy submissions) */}
      {soundcloudSubmissions.length > 0 && (
        <div className={tracks.length > 0 ? "mt-6" : ""}>
          {tracks.length === 0 && (
            <Text size="sm" color="secondary" className="mb-4">
              Listen to community covers on SoundCloud:
            </Text>
          )}
          <div className="grid gap-3">
            {soundcloudSubmissions.map((submission) => (
              <Card key={`${submission.roundId}-${submission.userId}`}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/profile/${submission.username}`}
                      className="text-[var(--color-accent-primary)] hover:underline font-medium"
                    >
                      {submission.publicDisplayName || submission.username}
                    </Link>
                  </div>
                  <Button variant="gradient" size="sm" asChild>
                    <a
                      href={submission.soundcloudUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Listen
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
