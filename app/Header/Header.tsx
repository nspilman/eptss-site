import React from "react";
import { SignupButton } from "../voting/Homepage/SignupButton";
import { FAQButton } from "components/NavButtons";
// import { RoundDatesDisplayPopup } from "../RoundDatesDisplay";
import Link from "next/link";
import { userSessionProvider } from "@/providers";
import {  NavMenu } from "@/components/Navbar/Navbar";
// import { getRoundsDates } from "../RoundDatesDisplay/useGetRoundsDates";

export const Header = async () => {
  const { userId } = await userSessionProvider();
  // const [current, next] = getRoundsDates();
  return (
    <div id="header" className="backdrop-blur fixed top-0 left-0 w-11/12 px-8">
      <div className="py-4 px-4 md:px-8 flex items-center justify-center md:justify-between">
        <Link href={"/"}>
          <span className="md:text-3xl font-fraunces font-semibold cursor-pointer hover:text-themeYellow">
            everyone plays the same song
          </span>
        </Link>

        <div className="hidden spacing-x-2 lg:flex items-center justify-center">
          < NavMenu />
        </div>
      </div>
    </div>
  );
};
