import Link from "next/link";
import React, { ReactElement } from "react";
import { useNavOptions } from "../../../hooks/useNavOptions";
import * as styles from "./SignupButton.css";

export const SignupButton = (): ReactElement => {
  const { signUp } = useNavOptions();

  return (
    <Link href={signUp}>
      <button className={styles.buttonPrimary}>Sign Up</button>
    </Link>
  );
};
