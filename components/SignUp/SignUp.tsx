import React from "react";

import { PageContainer } from "components/shared/PageContainer";
import { SignupForm } from "./SignupForm";
import { useRound } from "components/context/RoundContext";
import { useUserSession } from "components/context/UserSessionContext";
import { AlreadySignedUp } from "./AlreadySignedUp";
import { SignupsAreClosed } from "./SignupsAreClosed";
import { FormScaffolding } from "components/shared/FormScaffolding";

export const SignUp = () => {
  const { roundId, phase, dateLabels, isLoading } = useRound();
  const { userRoundDetails } = useUserSession();
  const areSignupsOpen = phase === "signups";
  const signupsCloseDateLabel = dateLabels?.signups.closes;
  const title = `Sign Up for Everyone Plays the Same Song round ${roundId}`;

  const shouldRenderForm = !!(
    areSignupsOpen &&
    roundId &&
    signupsCloseDateLabel
  );

  return (
    <PageContainer title={`Sign up for round ${roundId}`}>
      <FormScaffolding
        Form={
          <SignupForm
            roundId={roundId || 0}
            signupsCloseDateLabel={signupsCloseDateLabel}
            title={title}
          />
        }
        AlreadyCompleted={
          <AlreadySignedUp signupsCloseDateLabel={signupsCloseDateLabel} />
        }
        FormClosed={<SignupsAreClosed />}
        hasUserCompletedTask={userRoundDetails.hasSignedUp}
        isLoading={isLoading}
        shouldRenderForm={shouldRenderForm}
      />
    </PageContainer>
  );
};
