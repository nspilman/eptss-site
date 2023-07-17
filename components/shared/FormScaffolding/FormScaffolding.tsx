import React from "react";

import { SignInGate } from "components/shared/SignInGate";
import { Loading } from "components/shared/Loading";

interface Props {
  Form: React.ReactElement;
  AlreadyCompleted: React.ReactElement;
  FormClosed: React.ReactElement;
  isLoading: boolean;
  shouldRenderForm: boolean;
  hasUserCompletedTask: boolean;
}

export const FormScaffolding = ({
  Form,
  AlreadyCompleted,
  FormClosed,
  isLoading,
  shouldRenderForm,
  hasUserCompletedTask,
}: Props) => {
  return (
    <SignInGate>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {shouldRenderForm ? (
            <>{hasUserCompletedTask ? AlreadyCompleted : Form}</>
          ) : (
            FormClosed
          )}
        </>
      )}
    </SignInGate>
  );
};
