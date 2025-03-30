import React from "react";

import { roundProvider, userParticipationProvider } from "@/providers";
import { SignupPage } from "./SignupPage/SignupPage";
import { redirect } from "next/navigation";

const SignUp = async () => {
  const { roundId, dateLabels, hasRoundStarted } = await roundProvider();
  const  {roundDetails}  = await userParticipationProvider();
  const signupsCloseDateLabel = dateLabels?.signups.closes;

  if (hasRoundStarted) {
    // For the next round, we'll use the roundId + 1 as the slug if no specific slug is available
    // This assumes that the slug for the next round follows the same pattern or is the same as the roundId
    const nextRoundSlug = (roundId + 1).toString();
    redirect(`/sign-up/${nextRoundSlug}`);
  }

  return (
    <>
      <SignupPage
        signupsCloseDateLabel={signupsCloseDateLabel}
        roundId={roundId}
        hasSignedUp={roundDetails?.hasSignedUp || false}
      />
    </>
  );
};

export default SignUp;
