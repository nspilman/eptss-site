import React from "react";
import { FormContainer } from "components/shared/FormContainer";
import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { useSignup } from "./useSignup";
import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel";
import { Center, Link, Stack, Text } from "@chakra-ui/react";
import { Navigation } from "components/enum/navigation";
import { useUserSession } from "components/context/UserSessionContext";

interface Props {
  roundId: number;
  signupsCloseDateLabel: string;
}

export const SignUp = ({ roundId, signupsCloseDateLabel }: Props) => {
  const title = `Sign Up for Everyone Plays the Same Song round ${roundId}`;

  const { user } = useUserSession();

  if (!user) {
    throw new Error("Login required to access Signup page");
  }
  const { signUp, signupSuccess, fields } = useSignup(roundId, user.id);

  return (
    <Center>
      <FormContainer
        fields={fields}
        title={title}
        description={
          <Stack alignItems="center">
            <Text as="p">Signing up as {user.email}</Text>
            <Text as="p">Sign up with the song you want to cover!</Text>
            <Text>Signups close Midnight of {signupsCloseDateLabel}.</Text>
            <Link href={Navigation.FAQ} color="yellow.300">
              FAQ Here
            </Link>
          </Stack>
        }
        successBlock={<ActionSuccessPanel {...signupSuccess} />}
        errorMessage={GENERIC_ERROR_MESSAGE}
        onSubmit={signUp}
      />
    </Center>
  );
};
