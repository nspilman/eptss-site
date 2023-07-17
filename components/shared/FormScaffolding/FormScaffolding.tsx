import React from "react";

import { SignInGate } from "components/shared/SignInGate";
import { Loading } from "components/shared/Loading";

interface Props {
  Form: React.ReactElement;
  AlreadyCompleted: React.ReactElement;
  FormClosed: React.ReactElement;
  isLoading: boolean;
  shouldRenderSignupForm: boolean;
  hasUserCompletedTask: boolean;
}

export const FormScaffolding = ({
  Form,
  AlreadyCompleted,
  FormClosed,
  isLoading,
  shouldRenderSignupForm,
  hasUserCompletedTask,
}: Props) => {
  return (
    <SignInGate>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {shouldRenderSignupForm ? (
            <>{hasUserCompletedTask ? AlreadyCompleted : Form}</>
          ) : (
            FormClosed
          )}
        </>
      )}
    </SignInGate>
  );
};
