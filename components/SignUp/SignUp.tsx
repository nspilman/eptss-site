import React from "react";
import { SignupForm } from "./SignupForm";
import { SignupSuccess } from "./SignupSuccess";
import { useSuccessState } from "../hooks/useSuccessState";
import { FormContainer } from "components/shared/FormContainer";
import { GENERIC_ERROR_MESSAGE } from "../../constants";
import { useSignup } from "./useSignup";

interface Props {
  roundId: number;
}

export const SignUp = ({ roundId }: Props) => {
  const [successState, setSuccessState] = useSuccessState();

  const { signUp } = useSignup(roundId, setSuccessState);

  return (
    <FormContainer
      form={<SignupForm onSubmit={signUp} roundId={roundId} />}
      successBlock={<SignupSuccess />}
      errorMessage={GENERIC_ERROR_MESSAGE}
      successState={successState}
    />
  );
};
