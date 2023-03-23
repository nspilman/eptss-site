import React from "react";
import { FormContainer } from "components/shared/FormContainer";
import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { useSignup } from "./useSignup";
import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel";
import { Center, Link } from "@chakra-ui/react";
import { Navigation } from "components/enum/navigation";

interface Props {
  roundId: number;
  signupsCloseDateLabel: string;
}

export const SignUp = ({ roundId, signupsCloseDateLabel }: Props) => {
  const { signUp, signupSuccess, fields } = useSignup(roundId);

  const title = `Sign Up for Everyone Plays the Same Song round ${roundId}`;

  return (
    <Center>
      <FormContainer
        fields={fields}
        title={title}
        description={
          <div>
            Sign up with your name, email and the song you want to cover!
            <br />
            Signups close Midnight of {signupsCloseDateLabel}.
            <Link href={Navigation.HowItWorks} color="yellow.300">
              Full rules here
            </Link>
          </div>
        }
        successBlock={<ActionSuccessPanel {...signupSuccess} />}
        errorMessage={GENERIC_ERROR_MESSAGE}
        onSubmit={signUp}
      />
    </Center>
  );
};
