import React, { ReactElement } from "react";
import { useNavOptions } from "../../hooks/useNavOptions";
import { SignupButton } from "../../Homepage/SignupButton";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";

export const Header = (): ReactElement => {
  const { howItWorks } = useNavOptions();
  const router = useRouter();

  const { session, supabaseClient } = useSessionContext();
  const signOut = async () => {
    await supabaseClient.auth.signOut();
  };
  return (
    <Box as="header" id="header">
      <Flex alignItems="center" justifyContent="center">
        <Link href={"/"}>
          <Heading size={{ base: "md" }}>Everyone Plays the Same Song</Heading>
        </Link>
      </Flex>

      <Box display={{ base: "none" }}>
        <Link href={howItWorks}>
          <Button>The rules</Button>
        </Link>
        <SignupButton />
        {process.env.NODE_ENV === "development" && (
          <Button
            onClick={session ? () => signOut() : () => router.push("/la-cueva")}
          >
            {session ? "Sign Out" : "Sign in"}
          </Button>
        )}
      </Box>
    </Box>
  );
};
