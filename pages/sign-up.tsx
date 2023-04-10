import { GetServerSidePropsContext, InferGetStaticPropsType } from "next";
import React from "react";
import { SignUp } from "components/SignUp/SignUp";
import { PageContainer } from "components/shared/PageContainer";
import { PhaseMgmtService } from "services/PhaseMgmtService";

const SignupPage = ({
  roundId,
  areSignupsOpen,
  signupsCloseDateLabel,
  rootDomain,
}: InferGetStaticPropsType<typeof getServerSideProps>) => {
  return (
    <PageContainer title={`Sign up for round ${roundId}`}>
      {/* {areSignupsOpen ? ( */}
      <SignUp
        roundId={roundId}
        signupsCloseDateLabel={signupsCloseDateLabel}
        rootDomain={rootDomain}
      />
      {/* ) : (
        <JoinMailingList />
      )} */}
    </PageContainer>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const {
    phase,
    roundId,
    dateLabels: {
      signups: { closes: signupsCloseDateLabel },
    },
  } = await PhaseMgmtService.build();
  const areSignupsOpen = phase === "signups";

  const { req } = ctx;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const rootDomain = `${protocol}://${host}`;

  return {
    props: {
      roundId,
      areSignupsOpen,
      signupsCloseDateLabel,
      rootDomain,
    },
  };
}

export default SignupPage;
