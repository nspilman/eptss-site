import React from "react";

import { userSessionProvider } from "@/providers/userSessionProvider";
import { roundProvider } from "@/providers/roundProvider";
import { SignupPage } from "./SignupPage";

const SignUp = async () => {
  const { roundId, dateLabels } = await roundProvider();
  const { userRoundDetails } = await userSessionProvider();
  const userId = userRoundDetails?.user.userid || "";
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
