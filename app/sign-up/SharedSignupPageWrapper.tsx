import React from "react";
import { redirect } from "next/navigation";
import { roundProvider, userParticipationProvider } from "@/providers";
import { SignupPage } from "./SignupPage/SignupPage";
import { getAuthUser } from "@/utils/supabase/server";
import { db } from "@/db";
import { signUps, songs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { UserSignupData } from "@/types/signup";

interface SharedSignupPageWrapperProps {
  slug?: string;
}

export const SharedSignupPageWrapper = async ({ 
  slug 
}: SharedSignupPageWrapperProps) => {
  // Check if user is logged in
  const { userId } = getAuthUser();
  const isLoggedIn = !!userId;

  // If slug is provided, use it directly, otherwise get current round info
  const { roundId, dateLabels, hasRoundStarted, slug: currentSlug } = await roundProvider(slug);
  
  // Handle case when no slug is provided and round has started
  if (!slug && hasRoundStarted) {
    // For the next round, we'll use the roundId + 1 as the slug
    const nextRoundSlug = (roundId + 1).toString();
    redirect(`/sign-up/${nextRoundSlug}`);
  }

  // Handle case when round is not found
  if (!roundId) {
    return <div>Round not found</div>;
  }

  // Get user participation details
  const { roundDetails } = await userParticipationProvider({
    roundId,
  });
  
  // Fetch the user's existing signup data if they've already signed up
  let userSignup: UserSignupData | undefined = undefined;
  if (isLoggedIn && userId && roundDetails?.hasSignedUp) {
    const existingSignup = await db
      .select({
        songId: signUps.songId,
        youtubeLink: signUps.youtubeLink,
        additionalComments: signUps.additionalComments,
      })
      .from(signUps)
      .where(
        and(
          eq(signUps.userId, userId),
          eq(signUps.roundId, roundId)
        )
      )
      .limit(1);

    if (existingSignup.length > 0) {
      // Get the song details
      const songDetails = await db
        .select({
          title: songs.title,
          artist: songs.artist,
        })
        .from(songs)
        .where(eq(songs.id, existingSignup[0].songId))
        .limit(1);

      if (songDetails.length > 0) {
        userSignup = {
          songTitle: songDetails[0].title,
          artist: songDetails[0].artist,
          youtubeLink: existingSignup[0].youtubeLink,
          additionalComments: existingSignup[0].additionalComments || undefined,
        };
      }
    }
  }
  
  const signupsCloseDateLabel = dateLabels?.signups.closes;

  return (
    <SignupPage
      signupsCloseDateLabel={signupsCloseDateLabel}
      roundId={roundId}
      hasSignedUp={roundDetails?.hasSignedUp || false}
      slug={slug || currentSlug}
      isLoggedIn={isLoggedIn}
      userSignup={userSignup}
    />
  );
};
