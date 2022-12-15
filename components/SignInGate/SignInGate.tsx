import { useSessionContext } from "@supabase/auth-helpers-react";
import { SignIn } from "components/SignIn/SignIn";
import React from "react";

export const SignInGate = ({ children }: { children: React.ReactElement }) => {
  const { isLoading, session } = useSessionContext();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return !!session?.user ? <>{children}</> : <SignIn />;
};
