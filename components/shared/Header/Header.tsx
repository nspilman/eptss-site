import React, { ReactElement } from "react";
import { SignupButton } from "../../Homepage/SignupButton";
import { Box, Button, Flex, Heading, HStack, Link } from "@chakra-ui/react";
import { Navigation } from "components/enum/navigation";
import { featureFlags } from "utils/featureFlags";

export const Header = (): ReactElement => {
  return (
    <Box as="header" id="header">
      <Flex
        alignItems="center"
        justifyContent={{ base: "center", md: "space-between" }}
        h={"16"}
        px="8"
      >
        <Link href={"/"}>
          <Heading
            textStyle={"h1"}
            as="h1"
            size={{ base: "sm", lg: "md" }}
            _hover={{ color: "yellow.500" }}
          >
            everyone plays the same song
          </Heading>
        </Link>

        <HStack spacing="2" display={{ base: "none", lg: "block" }}>
          <Link href={Navigation.HowItWorks}>
            <Button variant="ghost">rules</Button>
          </Link>
          {featureFlags.auth && <SignupButton />}
        </HStack>
      </Flex>
    </Box>
  );
};
