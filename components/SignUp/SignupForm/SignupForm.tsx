import { Center, Link, Stack, Text } from "@chakra-ui/react";
import { useUserSession } from "components/context/UserSessionContext";
import { Navigation } from "components/enum/navigation";
import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel";
import { FormContainer } from "components/shared/FormContainer";
import { GENERIC_ERROR_MESSAGE } from "../../../constants";
import { useSignup } from "../useSignup";

interface Props {
  roundId?: number;
  title: string;
  signupsCloseDateLabel?: string;
}

export const SignupForm = ({
  roundId,
  title,
  signupsCloseDateLabel,
}: Props) => {
  const { user } = useUserSession();

  if (!user) {
    throw new Error("Login required to access Signup page");
  }

  if (!roundId || !signupsCloseDateLabel) {
    throw new Error("roundId and signupCloseDateLabel must be defined");
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
