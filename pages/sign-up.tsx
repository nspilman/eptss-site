import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { getCurrentRound } from "queries";
import { SignUp } from "components/SignUp/SignUp";
import { PageContainer } from "components/shared/PageContainer";
import { TimeBot5000 } from "services/Timebot5000/TimeBot5000";

const SignupPage = ({
  roundId,
  areSignupsOpen,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <PageContainer title={`Sign up for round ${roundId}`}>
      {areSignupsOpen ? (
        <SignUp roundId={roundId} />
      ) : (
        <div>
          <h2>Signups are closed - check back soon!</h2>
        </div>
      )}
    </PageContainer>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const { roundId } = await getCurrentRound();
  const timebot5000 = await TimeBot5000.build();
  const areSignupsOpen = timebot5000.getCurrentPhase() === "signups";

  return {
    props: {
      roundId,
      areSignupsOpen,
    },
  };
};

export default SignupPage;
