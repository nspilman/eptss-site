import * as styles from "./SignupAccess.css";
import Image from "next/image";
import Link from "next/link";
import { roundedCorners } from "styles/theme.css";

export const SignupSuccess = () => {
  return (
    <div className={styles.body}>
      <h2>
        Thank you for signing up for this round of Everyone Plays the Same Song!
      </h2>
      <p>
        You will get a welcome email with all the information and dates you will
        need.
      </p>
      <Image
        className={roundedCorners}
        src={"/welcomeImage.png"}
        alt={"Welcome to Everyone Plays the Same Song!"}
        width={500}
        height={500}
      />
      <p>Thanks for participating</p>
      <Link href="/#listen">
        <button>Home</button>
      </Link>
    </div>
  );
};
