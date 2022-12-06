import Link from "next/link";
import { useNavOptions } from "../../hooks/useNavOptions";
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
  roundContent: RoundDetails[];
}

export const Main = ({ roundContent }: Props) => {
  const { howItWorks } = useNavOptions();
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
          <p className={styles.blurb}>
            {"Round 16 is underway! Votes are due Friday, Dec 16"}
          </p>
          <div className={centered}>
            <Link href={howItWorks} id="learn">
              <button>Rules</button>
            </Link>
            <button>
              <Link href="#listen">Listen</Link>
            </button>
            <SignupButton />
          </div>
        </div>
        <div className={styles.cardHeader}>
          <h2>
            <a id="listen">The Playlists!</a>
          </h2>
          <hr />
        </div>
        {roundContent
          .filter((round) => round.title)
          .map((round) => {
            return <RoundDisplay key={round.round} round={round} />;
          })}
      </div>
    </main>
  );
};
