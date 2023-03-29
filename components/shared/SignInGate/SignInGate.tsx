import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

export const SignInGate = ({ children }: { children: React.ReactElement }) => {
  const { isLoading, session } = useSessionContext();
  const router = useRouter();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  useEffect(() => {
    // redirect to homepage if user is not signed in
    if (!session?.user) {
      router.push("/");
    }
  }, [session?.user]);

  return !!session?.user ? <>{children}</> : null;
};
