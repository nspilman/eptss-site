import React, { ReactElement } from "react";
import { SignupButton } from "../../Homepage/SignupButton";
import { FAQButton } from "components/NavButtons";
// import { RoundDatesDisplayPopup } from "../RoundDatesDisplay";
import Link from "next/link";
// import { getRoundsDates } from "../RoundDatesDisplay/useGetRoundsDates";
interface Props {
  userId?: string;
}

export const Header = ({ userId }: Props): ReactElement => {
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
          <SignupButton {...{ userId }} />
          {/* {current && next && <RoundDatesDisplayPopup {...{ current, next }} />} */}
        </div>
      </div>
    </div>
  );
};
