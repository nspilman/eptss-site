import React, { ReactElement } from "react";
import { Button, Link } from "@chakra-ui/react";
import { Navigation } from "components/enum/navigation";

export const SignupButton = (): ReactElement => {
  return (
    <Link href={Navigation.SignUp}>
      <Button variant="primary">Sign Up</Button>
    </Link>
  );
};
