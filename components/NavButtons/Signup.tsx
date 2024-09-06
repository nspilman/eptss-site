"use client";
import React, { ReactElement } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuthModal } from "@/components/client/context/EmailAuthModalContext";
import { signout } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";

interface Props {
  isLoggedIn?: boolean;
}

export const SignupButton = ({ isLoggedIn }: Props): ReactElement => {
  const router = useRouter();
  const { setIsOpen } = useAuthModal();
  const pathname = usePathname();
  const isUserProfileRoute = pathname === "/profile";

  if (isLoggedIn) {
    if (isUserProfileRoute) {
      return (
        <form action={signout}>
          <Button
            variant="outline"
            className="text-sm md:text-base text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-[#0a0a1e] transition-colors"
            type="submit"
          >
            Sign Out
          </Button>
        </form>
      );
    } else {
      return (
        <Button
          variant="ghost"
          className="p-2 hover:bg-gray-100 hover:text-[#0a0a1e] transition-colors rounded-full"
          onClick={() => console.log("profile")}
        >
          <UserIcon className="h-6 w-6" />
        </Button>
      );
    }
  } else {
    return (
      <Button
        variant="outline"
        className="text-sm md:text-base text-gray-600 border-gray-100 hover:bg-gray-100 hover:text-[#0a0a1e] transition-colors"
        onClick={setIsOpen}
      >
        Sign up / Log In!
      </Button>
    );
  }
};