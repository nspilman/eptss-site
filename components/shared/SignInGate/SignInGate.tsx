import { useUserSession } from "components/context/UserSessionContext";
import React from "react";
import { EmailAuthModal } from "../EmailAuthModal";
import { Loading } from "../Loading";

export const SignInGate = ({ children }: { children: React.ReactElement }) => {
  const { isLoading, user } = useUserSession();

  if (isLoading) {
    return <Loading />;
  }

  return !!user ? (
    <>{children}</>
  ) : (
    <div>
      <EmailAuthModal redirectUrl={window.location.href} isOpen={true} />
    </div>
  );
};
