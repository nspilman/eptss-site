import React, { ReactElement } from "react";
import { SignupButton } from "../../Homepage/SignupButton";
import { Box, Flex, Heading, HStack, Link } from "@chakra-ui/react";
import { FAQButton } from "components/NavButtons";

export const Header = (): ReactElement => {
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
      <Flex
        alignItems="center"
        justifyContent={{ base: "center", md: "space-between" }}
        px={{ base: "4", md: "8" }}
        py={"4"}
      >
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
        </HStack>
      </Flex>
    </Box>
  );
};
