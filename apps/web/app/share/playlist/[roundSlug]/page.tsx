import { Metadata } from "next";
import { notFound } from "next/navigation";
import { roundProvider, COVER_PROJECT_ID } from "@eptss/data-access";
import { PlaylistPageClient } from "./PlaylistPageClient";

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

  return (
    <PlaylistPageClient
      roundData={roundData}
      roundSlug={roundSlug}
    />
  );
}
