"use client";
import React, { ReactElement } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuthModal } from "@/components/client/context/EmailAuthModalContext";
import { signout } from "@/actions/actions";
import { Button } from "../ui/button";

interface Props {
  isLoggedIn?: boolean;
}

export const SignupButton = ({ isLoggedIn }: Props): ReactElement => {
  const router = useRouter();

  const { setIsOpen } = useAuthModal();

  // const onProfile = () => {
  //   router.push("/profile");
  // };

  const pathname = usePathname();

  // TODO: I don't love adding "if x route, do y" logic for generic components like this, since it degrades the reusability of the component
  // when we do a UI refactor, we should allow each route to render its own custom header component, and this won't be needed anymore.
  const isUserProfileRoute = pathname === "/profile";

  return (
    <>
      {isLoggedIn ? (
        isUserProfileRoute ? (
          //@ts-ignore
          <form action={signout}>
           <Button variant="outline" className="text-sm md:text-base text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-[#0a0a1e] transition-colors">
              Sign Out
            </Button>
          </form>
        ) : (
          <button onClick={() => console.log("profile")}>
            <Image
              src="/profile-icon.png"
              alt="profile icon"
              width={60}
              height={50}
              className="hover:shadow-NavShadow hover:cursor-pointer"
            />
          </button>
        )
      ) : (
        <Button variant="outline" onClick={setIsOpen} className="text-sm md:text-base text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-[#0a0a1e] transition-colors">
          Sign up / Log In!
        </Button>
      )}
    </>
  );
};
