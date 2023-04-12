import { InferGetStaticPropsType } from "next";
import React from "react";
import { SignUp } from "components/SignUp/SignUp";
import { PageContainer } from "components/shared/PageContainer";
import { PhaseMgmtService } from "services/PhaseMgmtService";
import { SignInGate } from "components/shared/SignInGate";

const SignupPage = ({
  roundId,
  areSignupsOpen,
  signupsCloseDateLabel,
}: InferGetStaticPropsType<typeof getServerSideProps>) => {
  return (
    <PageContainer title={`Sign up for round ${roundId}`}>
      <SignInGate>
        <SignUp
          roundId={roundId}
          signupsCloseDateLabel={signupsCloseDateLabel}
        />
      </SignInGate>
    </PageContainer>
  );
};

export async function getServerSideProps() {
  const {
    phase,
    roundId,
    dateLabels: {
      signups: { closes: signupsCloseDateLabel },
    },
  } = await PhaseMgmtService.build();
  const areSignupsOpen = phase === "signups";

  return {
    props: {
      roundId,
      areSignupsOpen,
      signupsCloseDateLabel,
    },
  };
}

export default SignupPage;
