import React, { ReactElement } from "react";
import { useNavOptions } from "../../hooks/useNavOptions";
import { Button, Link } from "@chakra-ui/react";

export const SignupButton = (): ReactElement => {
  const { signUp } = useNavOptions();

  return (
    <Link href={signUp}>
      <Button variant="primary">Sign Up</Button>
    </Link>
  );
};
