import React from "react";
import { SignupButton } from "../voting/Homepage/SignupButton";
import { FAQButton } from "components/NavButtons";
// import { RoundDatesDisplayPopup } from "../RoundDatesDisplay";
import Link from "next/link";
import { userSessionProvider } from "@/providers";
import NavMenus from "@/components/Navbar/NavMenus";

// import { getRoundsDates } from "../RoundDatesDisplay/useGetRoundsDates";

export const Header = async () => {
  const { userId } = await userSessionProvider();
  // const [current, next] = getRoundsDates();
  return (
    <div id="header" className="fixed bottom-0 left-0 sm: fixed top-0 left-0 w-11/12 px-8">
      <div className="py-4 px-4 md:px-8 flex items-center justify-center md:justify-between">
        <Link href={"/"}>
          <span className="md:text-3xl font-fraunces font-semibold cursor-pointer ">
            everyone plays the same song
          </span>
        </Link>
        <div >
        <NavMenus  userId={userId}/>
        </div>
      </div>
    </div>
  );
};
