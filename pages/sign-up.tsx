import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { SignUp } from "components/SignUp/SignUp";
import { PageContainer } from "components/shared/PageContainer";
import { PhaseMgmtService } from "services/PhaseMgmtService";
import { JoinMailingList } from "components/JoinMailingList";

const SignupPage = ({
  roundId,
  areSignupsOpen,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <PageContainer title={`Sign up for round ${roundId}`}>
      {areSignupsOpen ? <SignUp roundId={roundId} /> : <JoinMailingList />}
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const { phase, roundId } = await PhaseMgmtService.build();
  const areSignupsOpen = phase === "signups";

  return {
    props: {
      roundId,
      areSignupsOpen,
    },
  };
};

export default SignupPage;
