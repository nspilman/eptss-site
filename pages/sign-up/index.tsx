import { GetStaticProps, InferGetStaticPropsType } from "next";
import React from "react";
import { getCurrentRound } from "../../components/shared/queries";
import { SignUp } from "../../components/SignUp/SignUp";
import { getSupabaseClient } from "../../utils/getSupabaseClient";
import { getIsSuccess } from "../../utils/utils";

const SignupPage = ({
  roundId,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <SignUp roundId={roundId} />;
};

export const getStaticProps: GetStaticProps = async () => {
  const supabase = getSupabaseClient();
  const { roundId, status } = await getCurrentRound(supabase);
  if (!getIsSuccess(status)) {
    // throw new Error("Error retrieving current round");
  }
  return {
    props: {
      roundId,
    },
  };
};

export default SignupPage;
