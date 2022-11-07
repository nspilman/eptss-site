import Link from "next/link";
import React, { ReactElement } from "react";
import { useGetSignupLink } from "../../../hooks/useGetSignupLink";
import * as styles from "./Header.css";

const learnMoreLink = "/how-it-works";

export const Header = (): ReactElement => {
  const signupLink = useGetSignupLink();

  return (
    <header id="header" className={styles.header}>
      <Link href={"/"}>
        <span className={styles.titleText}>Everyone Plays the Same Song</span>
      </Link>
      <div className={styles.navButtons}>
        <Link href={learnMoreLink}>
          <button>The rules</button>
        </Link>
        <Link href={signupLink}>
          <button className={styles.removeAtTabletWidth}>Sign up</button>
        </Link>
      </div>
    </header>
  );
};
