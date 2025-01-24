import Head from "next/head";
import { roundProvider, userParticipationProvider } from "@/providers";
import { RoundsDisplay } from "./index/Homepage/RoundsDisplay";
import { HowItWorks } from "./index/Homepage/HowItWorks";
import { ClientHero } from "./ClientHero";
import { getBlurb } from "./index/Homepage/HowItWorks/getBlurb";
import { Navigation } from "@/enum/navigation";
import { Suspense } from "react";

const Homepage = async () => {
  const currentRound = await roundProvider();
  const {
    roundId,
    phase,
    song,
    dateLabels,
    hasRoundStarted,
    areSubmissionsOpen,
  } = currentRound;

  const isVotingPhase = phase === "voting";

  const { roundDetails } = await userParticipationProvider();

  const nextRound = (await roundProvider(roundId + 1));

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

  const signupsAreOpenString = `Signups are open for round ${
    hasRoundStarted ? roundId + 1 : roundId
  }`;

  return (
    <div className="">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <ClientHero
        roundInfo={currentRound}
        userRoundDetails={roundDetails}
        nextRoundInfo={nextRound}
        signedUpBlurb={signedUpBlurb}
        signupLink={signupLink}
        submitLink={submitLink}
        signupsAreOpenString={signupsAreOpenString}
      />
      <div className="container">
        <div className="flex flex-col gap-8 py-8">
          <Suspense>
            <HowItWorks />
          </Suspense>
          <RoundsDisplay currentRoundId={currentRound.roundId} isVotingPhase={isVotingPhase} phase={phase}/>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
