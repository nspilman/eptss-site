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
    <div id="header" className=" pt-4 top-0 left-0 px-8 z-10 sm:pt-6 ">
      <div className=" px-4  flex-col md:px-8 flex md:flex-row items-center justify-center md:justify-between">
        <Link href={"/"}>
          <span className=" text-2xl md:text-3xl font-fraunces font-semibold cursor-pointer ">
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
