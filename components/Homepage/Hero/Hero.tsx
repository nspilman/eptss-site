import Link from "next/link";
import { useNavOptions } from "../../hooks/useNavOptions";
import { centered } from "../../../styles/theme.css";
import { SignupButton } from "../SignupButton";
import * as styles from "./Hero.css";

export const Hero = () => {
  const { howItWorks } = useNavOptions();
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.title}>Everyone Plays the Same Song</h1>
        <p className={styles.text}>
          Everyone Plays the Same Song is a fun and educational community covers
          project. Members suggest and vote on songs to cover, submit their
          songs and then celebrate with a listening party. Please sign up and
          join us for the next round.
        </p>
        <div className={centered}>
          <Link href={howItWorks}>
            <button>Learn</button>
          </Link>
          <Link href="/#listen">
            <button>Listen</button>
          </Link>
          <SignupButton />
        </div>
      </div>
    </section>
  );
};
