import { Button, Link, Stack } from "@chakra-ui/react";
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
      <Button>
        <Link href="#listen" variant="button">
          Listen
        </Link>
      </Button>
      <SignupButton />
    </Stack>
  );
};