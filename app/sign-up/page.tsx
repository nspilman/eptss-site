import React from "react";

import { PageContainer } from "components/shared/PageContainer";
import { getUserSession } from "@/components/context/getUserSession";
import { FormScaffolding } from "components/shared/FormScaffolding";
import { getNewPhaseManager } from "@/services/PhaseMgmtService";
import { SignupForm } from "@/components/SignUp/SignupForm";
import { AlreadySignedUp } from "@/components/SignUp/AlreadySignedUp";
import { SignupsAreClosed } from "@/components/SignUp/SignupsAreClosed";

const SignUp = async () => {
  const { roundId, phase, dateLabels } = await getNewPhaseManager();
  const { userRoundDetails, user } = await getUserSession();
  const areSignupsOpen = phase === "signups";
  const signupsCloseDateLabel = dateLabels?.signups.closes;
  const title = `Sign Up for Everyone Plays the Same Song round ${roundId}`;

  const shouldRenderForm = !!(
    (areSignupsOpen && roundId && signupsCloseDateLabel)
    //  && false) //temporarily shut down signups
  );

  return (
    <PageContainer title={`Sign up for round ${roundId}`}>
      <FormScaffolding
        Form={
          <SignupForm
            userEmail={user?.email || ""}
            userId={user?.id || ""}
            roundId={roundId || 0}
            signupsCloseDateLabel={signupsCloseDateLabel}
            title={title}
          />
        }
        AlreadyCompleted={
          <AlreadySignedUp signupsCloseDateLabel={signupsCloseDateLabel} />
        }
        FormClosed={<SignupsAreClosed />}
        hasUserCompletedTask={userRoundDetails?.hasSignedUp || false}
        isLoading={false}
        shouldRenderForm={shouldRenderForm}
      />
    </PageContainer>
  );
};

export default SignUp;
