import React from "react";

import { roundProvider } from "@/providers/roundProvider";
import { SignupPage } from "./SignupPage";
import { userParticipationProvider } from "@/providers/userParticipationProvider";

const SignUp = async () => {
  const { roundId, dateLabels } = await roundProvider();
  const { userRoundDetails, userId } = await userParticipationProvider();
  const signupsCloseDateLabel = dateLabels?.signups.closes;

  return (
    <SignupPage
      userId={userId}
      signupsCloseDateLabel={signupsCloseDateLabel}
      roundId={roundId}
      hasSignedUp={userRoundDetails?.hasSignedUp || false}
    />
  );
};

export default SignUp;
