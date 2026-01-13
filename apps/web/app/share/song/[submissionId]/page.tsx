import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubmissionById } from "@eptss/data-access";
import { SongPageClient } from "./SongPageClient";

type Props = {
  params: Promise<{
    submissionId: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { submissionId } = await params;
  const id = parseInt(submissionId, 10);

  if (isNaN(id)) {
    return {
      title: "Submission Not Found | Everyone Plays the Same Song",
    };
  }

  const submission = await getSubmissionById(id);

  if (!submission) {
    return {
      title: "Submission Not Found | Everyone Plays the Same Song",
    };
  }

  const displayName = submission.publicDisplayName || submission.username;
  const songInfo = submission.songTitle && submission.songArtist
    ? `${submission.songTitle} by ${submission.songArtist}`
    : "a cover";

  return {
    title: `${displayName}'s cover of ${songInfo} | Everyone Plays the Same Song`,
    description: `Listen to ${displayName}'s cover of ${songInfo} on Everyone Plays the Same Song.`,
    openGraph: {
      title: `${displayName}'s cover of ${songInfo}`,
      description: `Listen to ${displayName}'s cover of ${songInfo} on Everyone Plays the Same Song.`,
      images: submission.coverImageUrl
        ? [{ url: submission.coverImageUrl, width: 400, height: 400, alt: `Cover art for ${displayName}'s submission` }]
        : [{ url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`, width: 1200, height: 630, alt: "Everyone Plays the Same Song" }],
    },
  };
}

export default async function ShareSongPage({ params }: Props) {
  const { submissionId } = await params;
  const id = parseInt(submissionId, 10);

  if (isNaN(id)) {
    notFound();
  }

  const submission = await getSubmissionById(id);

  if (!submission) {
    notFound();
  }

  return <SongPageClient submission={submission} />;
}
