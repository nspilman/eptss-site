import React from "react";

import { getUserSession } from "@/components/client/context/userSessionProvider";
import { roundManager } from "@/services/roundManager";
import { SignupPage } from "./SignupPage";

const SignUp = async () => {
  const { roundId, dateLabels } = await roundManager();
  const { userRoundDetails } = await getUserSession();
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
