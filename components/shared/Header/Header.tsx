import Link from "next/link";
import React, { ReactElement } from "react";
import { useNavOptions } from "../../hooks/useNavOptions";
import { SignupButton } from "../../Homepage/SignupButton";
import * as styles from "./Header.css";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { Button, useDisclosure } from "@chakra-ui/react";
import { EmailAuthModal } from "components/EmailAuthModal";

export const Header = (): ReactElement => {
  const { howItWorks } = useNavOptions();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { session, supabaseClient, isLoading } = useSessionContext();
  const signOut = async () => {
    await supabaseClient.auth.signOut();
  };

  return (
    <header id="header" className={styles.header}>
      <Link href={"/"}>
        <span className={styles.titleText}>Everyone Plays the Same Song</span>
      </Link>
      <div className={styles.navButtons}>
        <Button colorScheme="blue" variant="ghost" onClick={() => router.push("/how-it-works")}>
          Rules
        </Button>

        {isLoading ? null : session ? (
          <>
            <Button colorScheme="blue" onClick={() => router.push("/profile")}>
              Profile
            </Button>
            <Button variant="ghost" onClick={signOut}>
              Log Out
            </Button>
          </>
        ) : (
          <Button colorScheme="blue" variant="solid" onClick={onOpen}>
            Join Us!
          </Button>
        )}
      </div>
      <EmailAuthModal isOpen={isOpen} onClose={onClose} onOpen={onOpen} />
    </header>
  );
};
