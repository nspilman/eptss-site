import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

export const SignInGate = ({ children }: { children: React.ReactElement }) => {
  const { isLoading, session } = useSessionContext();
  const router = useRouter();

  useEffect(() => {
    // redirect to homepage if user is not signed in
    if (!isLoading && !session?.user) {
      router.push("/");
    }
  }, [session?.user]);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return !!session?.user ? <>{children}</> : null;
};
