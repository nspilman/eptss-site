import React from "react";
import { redirect } from "next/navigation";
import { roundProvider, userParticipationProvider, type ProjectSlug, getProjectBySlug } from "@eptss/data-access";
import { SignupPage } from "./SignupPage/SignupPage";
import { getAuthUser } from "@eptss/data-access/utils/supabase/server";
import { UserSignupData } from "@eptss/data-access/types/signup";
import { getNextRoundByVotingDate, getUserSignupData } from "@eptss/data-access";
import { signup, signupWithOTP } from "@/actions/userParticipationActions";
import { getProjectBusinessRules } from "@eptss/project-config";

interface SharedSignupPageWrapperProps {
  projectId: string;
  projectSlug: string;
  slug?: string;
}

export const SharedSignupPageWrapper = async ({
  projectId,
  projectSlug,
  slug
}: SharedSignupPageWrapperProps) => {
  // Check if user is logged in
  const { userId } = await getAuthUser();
  const isLoggedIn = !!userId;

  // Fetch project info
  const project = await getProjectBySlug(projectSlug);
  const projectName = project?.name || "EPTSS";
  console.log('[SharedSignupPageWrapper] ===== PROJECT INFO =====');
  console.log('[SharedSignupPageWrapper] projectSlug:', projectSlug);
  console.log('[SharedSignupPageWrapper] project:', project);
  console.log('[SharedSignupPageWrapper] projectName:', projectName);
  console.log('[SharedSignupPageWrapper] ========================');

  // Fetch project business rules
  const businessRules = await getProjectBusinessRules(projectSlug as ProjectSlug);
  console.log('[SharedSignupPageWrapper] Project:', projectSlug, 'Business Rules:', JSON.stringify(businessRules, null, 2));
  console.log('[SharedSignupPageWrapper] requireSongOnSignup:', businessRules.requireSongOnSignup);

  // If slug is provided, use it directly, otherwise get current round info
  const { roundId, dateLabels, hasRoundStarted, slug: currentSlug } = await roundProvider({ slug, projectId });

  // Handle case when no slug is provided and round has started
  if (!slug && hasRoundStarted) {
    // Get the round with the nearest voting start date in the future
    const nextRoundResult = await getNextRoundByVotingDate();
    if (nextRoundResult.status === 'success') {
      redirect(`/projects/${projectSlug}/sign-up/${nextRoundResult.data.slug}`);
    }
    // If no future round found, show an error
    return <div>No upcoming rounds available for signup</div>;
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
    userSignup = await getUserSignupData(userId, roundId);
  }

  const signupsCloseDateLabel = dateLabels?.signups.closes;

  return (
    <SignupPage
      signupsCloseDateLabel={signupsCloseDateLabel}
      roundId={roundId}
      hasSignedUp={roundDetails?.hasSignedUp || false}
      slug={slug || currentSlug}
      projectSlug={projectSlug}
      projectName={projectName}
      isLoggedIn={isLoggedIn}
      userSignup={userSignup}
      signup={signup}
      signupWithOTP={signupWithOTP}
      requireSongOnSignup={businessRules.requireSongOnSignup}
    />
  );
};
