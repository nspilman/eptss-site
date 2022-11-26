import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { getCurrentRound } from "queries";
import { SignUp } from "components/SignUp/SignUp";
import { getSupabaseClient } from "utils/getSupabaseClient";

const SignupPage = ({
  roundId,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <SignUp roundId={roundId} />;
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
