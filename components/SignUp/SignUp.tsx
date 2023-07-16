import React from "react";

import { Box, Heading, Text } from "@chakra-ui/react";
import { PageContainer } from "components/shared/PageContainer";
import { SignInGate } from "components/shared/SignInGate";
import { SignupForm } from "./SignupForm";
import { useRound } from "components/context/RoundContext";
import { Loading } from "components/shared/Loading";

export const SignUp = () => {
  const { roundId, phase, dateLabels, isLoading } = useRound();
  const areSignupsOpen = phase === "signups";
  const signupsCloseDateLabel = dateLabels?.signups.closes;
  const title = `Sign Up for Everyone Plays the Same Song round ${roundId}`;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <PageContainer title={`Sign up for round ${roundId}`}>
      <SignInGate>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {areSignupsOpen && roundId && signupsCloseDateLabel ? (
              <SignupForm {...{ roundId, signupsCloseDateLabel, title }} />
            ) : (
              <Box>
                <Heading>Signups are closed!</Heading>
                <Text>
                  You will receive an email when the next round opens!
                </Text>
              </Box>
            )}
          </>
        )}
      </SignInGate>
    </PageContainer>
  );
};
