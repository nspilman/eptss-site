"use client";
import React, { ReactElement } from "react";
import Image from "next/image";
import { signout } from "@eptss/actions";
import { Button } from "@eptss/ui";
import { routes } from "@eptss/routing";
import { useIsOnRoute } from "@eptss/routing/client";
import Link from "next/link";
import { LogOut, User, LogIn } from "lucide-react";

interface Props {
  isLoggedIn?: boolean;
}

export const SignupButton = ({ isLoggedIn }: Props): ReactElement => {
  // TODO: I don't love adding "if x route, do y" logic for generic components like this, since it degrades the reusability of the component
  // when we do a UI refactor, we should allow each route to render its own custom header component, and this won't be needed anymore.
  const isUserProfileRoute = useIsOnRoute(routes.dashboard.profile(), { exact: true });

  return (
    <>
      {isLoggedIn ? (
        isUserProfileRoute ? (
          //@ts-ignore
          <form action={signout}>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 text-gray-300 border-gray-700 hover:border-[#e2e240] hover:text-[#e2e240] transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </form>
        ) : (
          <Link href={routes.dashboard.profile()}>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-gray-300 border-gray-700 hover:border-[#e2e240] hover:text-[#e2e240] transition-all"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </Link>
        )
      ) : (
        <Link href={routes.auth.login()}>
          <Button
            variant="default"
            className="flex items-center gap-2 bg-[#e2e240] text-gray-900 hover:bg-[#f0f050] transition-all"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Log In</span>
          </Button>
        </Link>
      )}
    </>
  );
};
