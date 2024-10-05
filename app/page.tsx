import Head from "next/head";
import { roundProvider, userParticipationProvider } from "@/providers";
import { RoundsDisplay } from "./index/Homepage/RoundsDisplay";
import { HowItWorks } from "./index/Homepage/HowItWorks";
import { ClientHero } from "./ClientHero";
import { getBlurb } from "./index/Homepage/HowItWorks/getBlurb";
import { Navigation } from "@/enum/navigation";

const Homepage = async () => {
  const {  roundId,
    phase,
    song,
    dateLabels,
    hasRoundStarted,
    areSubmissionsOpen } = await roundProvider();

  const isVotingPhase = phase === "voting";

  const { userRoundDetails, userId } = await userParticipationProvider();

  const nextRound = await roundProvider(roundId + 1);

  const signedUpBlurb = getBlurb({
    phase,
    roundId,
    phaseEndsDatelabel: dateLabels[phase].closes,
  });

  const signupLink = `${Navigation.SignUp}/${
    hasRoundStarted ? roundId + 1 : ""
  }`;

  const submitLink = `${Navigation.Submit}/${
    areSubmissionsOpen ? "" : roundId - 1
  }`;

  const songText = song.artist && song.title ? `${song.title} by ${song.artist}` : "";
  const signupsAreOpenString = `Signups are open for round ${
    hasRoundStarted ? roundId + 1 : roundId
  }`;

  return (
    <div className="">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <ClientHero 
      roundInfo={{ roundId, phase, song, dateLabels, hasRoundStarted, areSubmissionsOpen }}
      userInfo={{ userId, userRoundDetails }}
      nextRoundInfo={nextRound}
      signedUpBlurb={signedUpBlurb}
      signupLink={signupLink}
      submitLink={submitLink}
      songText={songText}
      signupsAreOpenString={signupsAreOpenString} />
      <RoundsDisplay
        currentRound={roundId}
        isVotingPhase={isVotingPhase}
        phase={phase}
      />
      <HowItWorks />
    </div>
  );
};

export default Homepage;
