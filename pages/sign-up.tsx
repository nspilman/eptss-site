import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { SignUp } from "components/SignUp/SignUp";
import { PageContainer } from "components/shared/PageContainer";
import { PhaseMgmtService } from "services/PhaseMgmtService";
import { JoinMailingList } from "components/JoinMailingList";

const SignupPage = ({
  roundId,
  areSignupsOpen,
  signupsCloseDateLabel,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <PageContainer title={`Sign up for round ${roundId}`}>
      {areSignupsOpen ? (
        <SignUp
          roundId={roundId}
          signupsCloseDateLabel={signupsCloseDateLabel}
        />
      ) : (
        <JoinMailingList />
      )}
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async () => {
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
};

export default SignupPage;
