import { Button, Link, Stack } from "@chakra-ui/react";
import { SignupButton } from "components/Homepage/SignupButton";
import { useNavOptions } from "components/hooks/useNavOptions";

export const ActionButtons = () => {
  const { howItWorks } = useNavOptions();

  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      justifyContent="center"
      alignItems="center"
    >
      <Link id="learn" href={howItWorks} variant="button">
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
