import React, { ReactElement } from "react";
import { Button, useDisclosure, Image } from "@chakra-ui/react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { EmailAuthModal } from "components/shared/EmailAuthModal";
import { useRouter } from "next/router";

export const SignupButton = (): ReactElement => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { session, supabaseClient } = useSessionContext();
  const router = useRouter();

  const signOut = async () => {
    await supabaseClient.auth.signOut();
  };

  const onProfile = () => {
    router.push("/profile");
  };

  // TODO: I don't love adding "if x route, do y" logic for generic components like this, since it degrades the reusability of the component
  // when we do a UI refactor, we should allow each route to render its own custom header component, and this won't be needed anymore.
  const isUserProfileRoute = router.pathname === "/profile";

  return (
    <>
      {session?.user ? (
        isUserProfileRoute ? (
          <Button variant={"outline"} onClick={signOut}>
            {"Sign Out"}
          </Button>
        ) : (
          <button onClick={onProfile}>
            <Image src="/profile-icon.png" height="50px" />
          </button>
        )
      ) : (
        <Button onClick={onOpen}>{"Sign up / Log In!"}</Button>
      )}
      <EmailAuthModal isOpen={isOpen} onClose={onClose} />
    </>
  );
};
