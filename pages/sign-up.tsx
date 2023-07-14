import { InferGetStaticPropsType } from "next";
import React from "react";
import { SignUp } from "components/SignUp/SignUp";
import { PhaseMgmtService } from "services/PhaseMgmtService";

const SignupPage = ({
  roundId,
  areSignupsOpen,
  signupsCloseDateLabel,
}: InferGetStaticPropsType<typeof getServerSideProps>) => {
  return (
    <SignUp
      roundId={roundId}
      signupsCloseDateLabel={signupsCloseDateLabel}
      areSignupsOpen={areSignupsOpen}
    />
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
