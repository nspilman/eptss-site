import React from "react";
import { redirect } from "next/navigation";
import { roundProvider, userParticipationProvider } from "@/providers";
import { SignupPage } from "./SignupPage/SignupPage";
import { getAuthUser } from "@/utils/supabase/server";

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
  
  const signupsCloseDateLabel = dateLabels?.signups.closes;

  return (
    <SignupPage
      signupsCloseDateLabel={signupsCloseDateLabel}
      roundId={roundId}
      hasSignedUp={roundDetails?.hasSignedUp || false}
      slug={slug || currentSlug}
      isLoggedIn={isLoggedIn}
    />
  );
};
