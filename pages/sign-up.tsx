import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { getCurrentRound } from "queries";
import { SignUp } from "components/SignUp/SignUp";
import { getSupabaseClient } from "utils/getSupabaseClient";
import { PageContainer } from "components/shared/PageContainer";
import { TimeBot5000 } from "utils/TimeBot5000";

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
  const supabase = getSupabaseClient();
  const { roundId } = await getCurrentRound(supabase);
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
