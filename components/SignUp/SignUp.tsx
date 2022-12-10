import React from "react";
import { SignupForm } from "./SignupForm";
import { useSuccessState } from "../hooks/useSuccessState";
import { FormContainer } from "components/shared/FormContainer";
import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { useSignup } from "./useSignup";
import { ActionSuccessPanel } from "components/shared/ActionSuccessPanel";

interface Props {
  roundId: number;
}

export const SignUp = ({ roundId }: Props) => {
  const [successState, setSuccessState] = useSuccessState();

  const { signUp, signupSuccess } = useSignup(roundId, setSuccessState);

  return (
    <FormContainer
      form={<SignupForm onSubmit={signUp} roundId={roundId} />}
      successBlock={<ActionSuccessPanel {...signupSuccess} />}
      errorMessage={GENERIC_ERROR_MESSAGE}
      successState={successState}
    />
  );
};
