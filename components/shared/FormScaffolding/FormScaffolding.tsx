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
  userId?: string;
  redirectUrl: string;
}

export const FormScaffolding = ({
  Form,
  AlreadyCompleted,
  FormClosed,
  isLoading,
  shouldRenderForm,
  hasUserCompletedTask,
  userId,
  redirectUrl,
}: Props) => {
  return (
    <SignInGate userId={userId} redirectUrl={redirectUrl}>
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
