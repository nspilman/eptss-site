import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { getCurrentRound } from "queries";
import { SignUp } from "components/SignUp/SignUp";
import { getSupabaseClient } from "utils/getSupabaseClient";
import { PageContainer } from "components/shared/PageContainer";

const SignupPage = ({
  roundId,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const signupsClose = new Date("Dec 5, 2022");
  const today = new Date();

  const areSignupsOpen = today <= signupsClose;
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

  return {
    props: {
      roundId,
    },
  };
};

export default SignupPage;
