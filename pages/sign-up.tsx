import { InferGetStaticPropsType } from "next";
import React from "react";
import { SignUp } from "components/SignUp/SignUp";
import { PageContainer } from "components/shared/PageContainer";
import { PhaseMgmtService } from "services/PhaseMgmtService";
import { SignInGate } from "components/shared/SignInGate";
import { Box, Heading, Text } from "@chakra-ui/react";

const SignupPage = ({
  roundId,
  areSignupsOpen,
  signupsCloseDateLabel,
}: InferGetStaticPropsType<typeof getServerSideProps>) => {
  return (
    <PageContainer title={`Sign up for round ${roundId}`}>
      <SignInGate>
        {areSignupsOpen ? (
          <SignUp
            roundId={roundId}
            signupsCloseDateLabel={signupsCloseDateLabel}
          />
        ) : (
          <Box>
            <Heading>Signups are closed!</Heading>
            <Text>You will receive an email when the next round opens!</Text>
          </Box>
        )}
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
