import { Box } from "@chakra-ui/react";
import { useUserSession } from "components/context/UserSessionContext";
import React from "react";
import { EmailAuthModal } from "../EmailAuthModal";

export const SignInGate = ({ children }: { children: React.ReactElement }) => {
  const { isLoading, user } = useUserSession();

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  return !!user ? (
    <>{children}</>
  ) : (
    <Box>
      <EmailAuthModal redirectUrl={window.location.href} isOpen={true} />
    </Box>
  );
};
