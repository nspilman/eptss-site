import Head from "next/head";
import { roundProvider, userParticipationProvider } from "@/providers";
import { format } from "date-fns";
import { Hero } from "./voting/Homepage/Hero";
import { RoundActionCard } from "./voting/Homepage/RoundActionCard";
import { RoundsDisplay } from "./voting/Homepage/RoundsDisplay";
import { HowItWorks } from "./voting/Homepage/HowItWorks";

const Homepage = async () => {
  const { phase, dateLabels, roundId, dates, song  } = await roundProvider();

  const phaseEndsDate = format(dates[phase].closes, "yyyy-MM-dd");
  const phaseEndsDatelabel = dateLabels[phase].closes;
  const isVotingPhase = phase === "voting";

  const { userRoundDetails } = await userParticipationProvider();
  return (
    <div className="flex flex-col gap-4 items-center">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <div className="flex justify-center items-center h-4/5">
      <Hero />
      </div>
     
      <div className="mt-8 md:-mt-20 mb-12">
        <RoundActionCard
          phase={phase}
          roundId={roundId}
          phaseEndsDate={phaseEndsDate}
          phaseEndsDatelabel={phaseEndsDatelabel}
          userRoundDetails={userRoundDetails}
          song={song}
        />
      </div>
      <RoundsDisplay
        currentRound={roundId}
        isVotingPhase={isVotingPhase}
        phase={phase}
      />
      {/* <HowItWorks /> */}
    </div>
  );
};

export default Homepage;
