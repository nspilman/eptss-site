import React from "react";
import { SignupButton } from "../index/Homepage/SignupButton";
import { FAQButton } from "components/NavButtons";
// import { RoundDatesDisplayPopup } from "../RoundDatesDisplay";
import Link from "next/link";
import { userSessionProvider } from "@/providers";
// import { getRoundsDates } from "../RoundDatesDisplay/useGetRoundsDates";

export const Header = async () => {
  const { userId } = await userSessionProvider();
  // const [current, next] = getRoundsDates();
  return (
    <div id="header" className="backdrop-blur fixed top-0 left-0 w-full">
      <div className="py-4 px-4 md:px-8 flex items-center justify-center md:justify-between">
        <Link href={"/"}>
          <span className="md:text-xl font-fraunces font-semibold text-white cursor-pointer hover:text-themeYellow">
            everyone plays the same song
          </span>
        </Link>

        <div className="hidden spacing-x-2 lg:flex items-center justify-center">
          <FAQButton />
          <SignupButton isLoggedIn={!!userId} />
          {/* {current && next && <RoundDatesDisplayPopup {...{ current, next }} />} */}
        </div>
      </div>
    </div>
  );
};
