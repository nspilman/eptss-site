import Link from "next/link";
import React, { ReactElement } from "react";
import { useNavOptions } from "../../hooks/useNavOptions";
import { SignupButton } from "../../Homepage/SignupButton";
import * as styles from "./Header.css";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Router } from "next/router";
import { useRouter } from "next/router";

export const Header = (): ReactElement => {
  const { howItWorks } = useNavOptions();
  const router = useRouter();

  const { session, supabaseClient } = useSessionContext();
  const signOut = async () => {
    await supabaseClient.auth.signOut();
  };
  return (
    <header id="header" className={styles.header}>
      <Link href={"/"}>
        <span className={styles.titleText}>Everyone Plays the Same Song</span>
      </Link>
      <div className={styles.navButtons}>
        <Link href={howItWorks}>
          <button>The rules</button>
        </Link>
        <SignupButton />
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={session ? () => signOut() : () => router.push("/la-cueva")}
          >
            {session ? "Sign Out" : "Sign in"}
          </button>
        )}
      </div>
    </header>
  );
};
