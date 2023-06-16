import React, { ReactElement } from "react";
import { SignupButton } from "../../Homepage/SignupButton";
import { Box, Flex, Heading, HStack, Link } from "@chakra-ui/react";
import { FAQButton } from "components/NavButtons";

export const Header = (): ReactElement => {
  return (
    <Box as="header" id="header">
      <Flex
        alignItems="center"
        justifyContent={{ base: "center", md: "space-between" }}
        px="4"
        py="2"
      >
        <Link href={"/"}>
          <Heading
            textStyle={"h1"}
            as="h1"
            fontFamily={"Fraunces"}
            size={{ base: "sm", lg: "lg" }}
            fontWeight="700"
          >
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
