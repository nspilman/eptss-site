import React, { ReactElement } from "react";
import { SignupButton } from "../../Homepage/SignupButton";
import { Box, Heading, HStack, Link } from "@chakra-ui/react";
import { FAQButton } from "components/NavButtons";
import { RoundDatesDisplayPopup } from "../RoundDatesDisplay";
import { useGetRoundsDates } from "../RoundDatesDisplay/useGetRoundsDates";

export const Header = (): ReactElement => {
  const [current, next] = useGetRoundsDates();
  return (
    <Box
      as="header"
      id="header"
      background="rgba(0,0,0,0.4)"
      backdropBlur={"xl"}
      backdropFilter={"blur(6px)"}
      position="fixed"
      top={0}
      left={0}
      width={"100%"}
      zIndex="sticky"
    >
      <div className="py-4 px-4 md:px-8 flex items-center justify-center md:justify-between">
        <Link href={"/"}>
          <Heading size={{ base: "xs", lg: "md" }}>
            everyone plays the same song
          </Heading>
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
    </Box>
  );
};
