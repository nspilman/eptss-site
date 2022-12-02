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
        <h1>Everyone Plays the Same Song</h1>
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
