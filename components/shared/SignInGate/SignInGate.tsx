import { Box } from "@chakra-ui/react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React from "react";
import { EmailAuthModal } from "../EmailAuthModal";

export const SignInGate = ({ children }: { children: React.ReactElement }) => {
  const { isLoading, session } = useSessionContext();
  const router = useRouter();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  console.log(window.location.href);

  return !!session?.user ? (
    <>{children}</>
  ) : (
    <Box>
      <EmailAuthModal redirectUrl={window.location.href} isOpen={true} />
    </Box>
  );
};
