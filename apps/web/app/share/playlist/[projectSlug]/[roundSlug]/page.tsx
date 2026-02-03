import { Metadata } from "next";
import { notFound } from "next/navigation";
import { roundProvider, getProjectIdFromSlug, type ProjectSlug } from "@eptss/core";
import { PlaylistPageClient } from "../../[roundSlug]/PlaylistPageClient";

interface Props {
  params: Promise<{
    projectSlug: string;
    roundSlug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectSlug, roundSlug } = await params;

  const isValidProject = projectSlug === "cover" || projectSlug === "monthly-original";
  if (!isValidProject) {
    return {
      title: "Playlist Not Found | Everyone Plays the Same Song",
    };
  }

  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  try {
    const roundData = await roundProvider({ slug: roundSlug, projectId });

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
        description: `Listen to all the covers from Round ${roundData.roundId} of Everyone Plays the Same Song` ,
        images: [{ url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Everyone Plays the Same Song" }],
      },
    };
  } catch {
    return {
      title: "Playlist | Everyone Plays the Same Song",
    };
  }
}

export default async function ShareProjectPlaylistPage({ params }: Props) {
  const { projectSlug, roundSlug } = await params;

  const isValidProject = projectSlug === "cover" || projectSlug === "monthly-original";
  if (!isValidProject) {
    notFound();
  }

  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);
  const roundData = await roundProvider({ slug: roundSlug, projectId }).catch(() => null);

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
