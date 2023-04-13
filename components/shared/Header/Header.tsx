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
        justifyContent="space-between"
        h={"16"}
        px={{ base: "4", lg: "16" }}
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

        <HStack spacing="2">
          <Link
            href={Navigation.HowItWorks}
            display={{ base: "none", lg: "block" }}
          >
            <Button variant="ghost">rules</Button>
          </Link>
          {featureFlags.auth && (
            <SignupButton buttonProps={{ size: { base: "sm", lg: "md" } }} />
          )}
        </HStack>
      </Flex>
    </Box>
  );
};
