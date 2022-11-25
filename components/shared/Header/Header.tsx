import Link from "next/link";
import React, { ReactElement } from "react";
import { useNavOptions } from "../../hooks/useNavOptions";
import { SignupButton } from "../../Homepage/SignupButton";
import * as styles from "./Header.css";

export const Header = (): ReactElement => {
  const { howItWorks } = useNavOptions();

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
      </div>
    </header>
  );
};
