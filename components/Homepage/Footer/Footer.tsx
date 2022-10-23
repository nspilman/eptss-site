import { centered } from "../../../styles/theme.css";
import { SignupButton } from "../SignupButton";
import * as styles from "./Footer.css";

export const Footer = () => (
  <footer className={styles.footer}>
    <div className={centered}>
      <SignupButton />
    </div>
  </footer>
);
