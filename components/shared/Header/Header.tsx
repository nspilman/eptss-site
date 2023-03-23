import React, { ReactElement } from "react";
import { SignupButton } from "../../Homepage/SignupButton";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import { Navigation } from "components/enum/navigation";
import { EmailAuthModal } from "components/EmailAuthModal";

export const Header = (): ReactElement => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const signOut = async () => {
    await supabaseClient.auth.signOut();
  };

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
            size={{ base: "sm", lg: "lg" }}
            fontWeight="300"
          >
            Everyone Plays the Same Song
          </Heading>
        </Link>

        <Box display={{ base: "none", lg: "block" }}>
          <Link href={Navigation.HowItWorks}>
            <Button>The rules</Button>
          </Link>
          <SignupButton />
          {process.env.NODE_ENV === "development" && (
            <Button
              onClick={
                session ? () => signOut() : () => router.push("/la-cueva")
              }
            >
              {session ? "Sign Out" : "Sign in"}
            </Button>
          )}
        </Box>
      </Flex>
    </Box>
  );
};
