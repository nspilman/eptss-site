import React, { ReactElement } from "react";
import { Button, useDisclosure } from "@chakra-ui/react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { EmailAuthModal } from "components/EmailAuthModal";

export const SignupButton = (): ReactElement => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { session, supabaseClient } = useSessionContext();

  const signOut = async () => {
    await supabaseClient.auth.signOut();
  };

  return (
    <>
      {process.env.NODE_ENV === "development" &&
        (session ? (
          <Button onClick={onOpen}>{"Join Us!"}</Button>
        ) : (
          <Button variant={"outline"} onClick={signOut}>
            {"Sign Out"}
          </Button>
        ))}
      <EmailAuthModal isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
    </>
  );
};
