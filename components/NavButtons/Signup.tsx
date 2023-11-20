import React, { ReactElement } from "react";
import Image from "next/image";
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
          <button
            className=" h-10 py-2 px-4 border-2 font-bold text-white border-white bg-transparent flex items-center rounded-md
       hover:bg-white hover:text-black hover:shadow-NavShadow hover:cursor-pointer"
            onClick={signOut}
          >
            Sign Out
          </button>
        ) : (
          <button onClick={onProfile}>
            <Image
              src="/profile-icon.png"
              alt="profile icon"
              width="60px"
              height="50px"
              className="hover:shadow-NavShadow hover:cursor-pointer"
            />
          </button>
        )
      ) : (
        <button
          className="btn-main"
          onClick={setIsOpen}
        >
          Sign up / Log In!
        </button>
      )}
    </>
  );
};
