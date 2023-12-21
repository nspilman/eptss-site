import React, { ReactElement } from "react";
import { SignupButton } from "../../Homepage/SignupButton";
import { HStack } from "@chakra-ui/react";
import { FAQButton } from "components/NavButtons";
import { RoundDatesDisplayPopup } from "../RoundDatesDisplay";
import { useGetRoundsDates } from "../RoundDatesDisplay/useGetRoundsDates";
import Link from "next/link";

export const Header = (): ReactElement => {
  const [current, next] = useGetRoundsDates();
  return (
    <div id="header" className="backdrop-blur fixed top-0 left-0 w-full">
      <div className="py-4 px-4 md:px-8 flex items-center justify-center md:justify-between">
        <Link href={"/"}>
          <span className="md:text-xl font-fraunces font-semibold text-white cursor-pointer hover:text-themeYellow">
            everyone plays the same song
          </span>
        </Link>

        <HStack
          spacing="2"
          display={{ base: "none", lg: "flex" }}
          alignItems="center"
          justifyContent="center"
        >
          <FAQButton />
          <SignupButton />
          {current && next && <RoundDatesDisplayPopup {...{ current, next }} />}
        </HStack>
      </div>
    </div>
  );
};
