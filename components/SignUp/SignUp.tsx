import React from "react";

import { Box, Heading, Text } from "@chakra-ui/react";
import { PageContainer } from "components/shared/PageContainer";
import { SignInGate } from "components/shared/SignInGate";
import { SignupForm } from "./SignupForm";

export interface Props {
  roundId: number;
  signupsCloseDateLabel: string;
  areSignupsOpen: boolean;
}

export const SignUp = ({
  roundId,
  signupsCloseDateLabel,
  areSignupsOpen,
}: Props) => {
  const title = `Sign Up for Everyone Plays the Same Song round ${roundId}`;

  return (
    <PageContainer title={`Sign up for round ${roundId}`}>
      {areSignupsOpen ? (
        <SignInGate>
          <SignupForm {...{ roundId, signupsCloseDateLabel, title }} />
        </SignInGate>
      ) : (
        <Box>
          <Heading>Signups are closed!</Heading>
          <Text>You will receive an email when the next round opens!</Text>
        </Box>
      )}
    </PageContainer>
  );
};
