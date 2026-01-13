import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { roundProvider, COVER_PROJECT_ID } from "@eptss/data-access";
import { Playlist, type Track } from "@eptss/media-display";
import { Card, CardContent, Text, Display, Button } from "@eptss/ui";
import { ArrowRight } from "lucide-react";

type Props = {
  params: Promise<{
    roundSlug: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { roundSlug } = await params;

  try {
    const roundData = await roundProvider({ slug: roundSlug, projectId: COVER_PROJECT_ID });

    if (!roundData || roundData.roundId === 0) {
      return {
        title: "Playlist Not Found | Everyone Plays the Same Song",
      };
    }

    const songInfo = roundData.song?.title && roundData.song?.artist
      ? `${roundData.song.title} by ${roundData.song.artist}`
      : `Round ${roundData.roundId}`;

    return {
      title: `${songInfo} Playlist | Everyone Plays the Same Song`,
      description: `Listen to all the covers from Round ${roundData.roundId} of Everyone Plays the Same Song - ${songInfo}`,
      openGraph: {
        title: `${songInfo} Playlist`,
        description: `Listen to all the covers from Round ${roundData.roundId} of Everyone Plays the Same Song`,
        images: [{ url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Everyone Plays the Same Song" }],
      },
    };
  } catch {
    return {
      title: "Playlist | Everyone Plays the Same Song",
    };
  }
}

export default async function SharePlaylistPage({ params }: Props) {
  const { roundSlug } = await params;

  const roundData = await roundProvider({ slug: roundSlug, projectId: COVER_PROJECT_ID }).catch(() => null);

  if (!roundData || roundData.roundId === 0) {
    notFound();
  }

  // Filter submissions that have audio
  const submissionsWithAudio = roundData.submissions.filter(
    (s) => s.audioFileUrl || s.soundcloudUrl
  );

  // Convert submissions to Track format for playlist
  const tracks: Track[] = submissionsWithAudio
    .filter((s) => s.audioFileUrl) // Only include direct audio files in playlist
    .map((submission) => ({
      id: `${submission.roundId}-${submission.userId}`,
      src: submission.audioFileUrl!,
      title: `${roundData.song?.title || "Cover"} - ${submission.username}`,
      artist: submission.username,
      duration: submission.audioDuration ? submission.audioDuration / 1000 : undefined,
      fileSize: submission.audioFileSize || undefined,
      coverArt: submission.coverImageUrl || undefined,
    }));

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
                    <Text>{submission.username}</Text>
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
