import { Box } from "@chakra-ui/react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import React from "react";
import { EmailAuthModal } from "../EmailAuthModal";

export const SignInGate = ({ children }: { children: React.ReactElement }) => {
  const { isLoading, session } = useSessionContext();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return !!session?.user ? (
    <>{children}</>
  ) : (
    <Box>
      <EmailAuthModal redirectUrl={window.location.href} isOpen={true} />
    </Box>
  );
};
