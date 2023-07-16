import React, { ReactElement } from "react";
import { Button, Image } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuthModal } from "components/context/EmailAuthModal";
import { useUserSession } from "components/context/UserSessionContext";

export const SignupButton = (): ReactElement => {
  const { user, signOut } = useUserSession();
  const router = useRouter();

  const { setIsOpen } = useAuthModal();

  const onProfile = () => {
    router.push("/profile");
  };

  // TODO: I don't love adding "if x route, do y" logic for generic components like this, since it degrades the reusability of the component
  // when we do a UI refactor, we should allow each route to render its own custom header component, and this won't be needed anymore.
  const isUserProfileRoute = router.pathname === "/profile";

  return (
    <>
      {user ? (
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
        <Button onClick={setIsOpen}>{"Sign up / Log In!"}</Button>
      )}
    </>
  );
};
