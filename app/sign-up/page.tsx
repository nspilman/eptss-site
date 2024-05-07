import React from "react";

import { roundProvider, userParticipationProvider } from "@/providers";
import { SignupPage } from "./SignupPage";
import { redirect } from "next/navigation";

const SignUp = async () => {
  const { roundId, dateLabels, hasRoundStarted } = await roundProvider();
  const { userRoundDetails, userId } = await userParticipationProvider();
  const signupsCloseDateLabel = dateLabels?.signups.closes;

  if (hasRoundStarted) {
    redirect(`/sign-up/${roundId + 1}`);
  }

  return (
    <>
      <SignupPage
        userId={userId}
        signupsCloseDateLabel={signupsCloseDateLabel}
        roundId={roundId}
        hasSignedUp={userRoundDetails?.hasSignedUp || false}
      />
    </>
  );
};

export default SignUp;
