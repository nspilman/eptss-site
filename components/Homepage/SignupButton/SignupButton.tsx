import React, { ReactElement } from "react";
import { useGetSignupLink } from "../../../hooks/useGetSignupLink";
import * as styles from "./SignupButton.css";

export const SignupButton = (): ReactElement => {
  const signupLink: string = useGetSignupLink();

  return (
    <a target="_blank" rel="noreferrer" href={signupLink}>
      <button className={styles.buttonPrimary}>Sign Up</button>
    </a>
  );
};
