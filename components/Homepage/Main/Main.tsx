import Link from "next/link";
import { GENERAL_INFO_SLUG } from "../../../constants";
import { centered } from "../../../styles/theme.css";
import { RoundDetails } from "../../../types";
import { SignupButton } from "../SignupButton";
import * as styles from "./Main.css";
import { RoundDisplay } from "./RoundDisplay";

const howItWorksContent = [
  {
    title: "1. Sign Up",
    description: "Sign up and submit a song that you would like to cover.",
  },
  {
    title: "2. Select",
    description:
      "Vote for the song that all participants will cover as a community.",
  },
  {
    title: "3. Submit",
    description:
      "Submit your cover and celebrate with a virtual listening party.",
  },
];

interface Props {
  blurb: string;
  roundContent: RoundDetails[];
}

export const Main = ({ blurb, roundContent }: Props) => {
  return (
    <main className="main">
      <div className={styles.container}>
        <div className={styles.cardHeader}>
          <h2>How It Works</h2>
          <hr />
        </div>
        <div className={styles.card}>
          <div className={styles.howItWorks}>
            {howItWorksContent.map(({ title, description }) => (
              <div key={title} className={styles.itemThird}>
                <h3>{title}</h3>
                <p>{description} </p>
              </div>
            ))}
          </div>
          <p className={styles.howItWorksText}>{blurb}</p>
          <div className={centered}>
            <Link href={GENERAL_INFO_SLUG} id="learn">
              <button>Learn More</button>
            </Link>
            <button>
              <Link href="#listen">Listen</Link>
            </button>
            <SignupButton />
          </div>
        </div>
        <div className={styles.cardHeader}>
          <h2>
            <a id="listen">Community Covers</a>
          </h2>
          <hr />
        </div>
        {roundContent.map((round) => {
          return <RoundDisplay key={round.round} round={round} />;
        })}
      </div>
    </main>
  );
};
