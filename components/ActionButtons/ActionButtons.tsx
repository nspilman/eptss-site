import { Button, Link, Stack, useDisclosure } from "@chakra-ui/react";
import { Navigation } from "components/enum/navigation";
import { SignupButton } from "components/Homepage/SignupButton";

export const ActionButtons = () => {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      justifyContent="center"
      alignItems="center"
    >
      <Link id="learn" href={Navigation.HowItWorks} variant="button">
        <Button>Rules</Button>
      </Link>
      <Link href="#listen" variant="button">
        <Button>Listen</Button>
      </Link>
      <SignupButton />
    </Stack>
  );
};
