import Head from "next/head";
import { roundProvider, userParticipationProvider } from "@/providers";
import { format } from "date-fns";
import { Hero } from "./voting/Homepage/Hero";
import { RoundActionCard } from "./voting/Homepage/RoundActionCard";
import { RoundsDisplay } from "./voting/Homepage/RoundsDisplay";
import { HowItWorks } from "./voting/Homepage/HowItWorks";

const Homepage = async () => {
  const { phase, dateLabels, roundId, dates } = await roundProvider();

  const phaseEndsDate = format(dates[phase].closes, "yyyy-MM-dd");
  const phaseEndsDatelabel = dateLabels[phase].closes;
  const isVotingPhase = phase === "voting";

  const { userRoundDetails } = await userParticipationProvider();
  return (
    <div className="flex flex-col items-center">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <Hero />
      <div className="pointer-events-none">
        <div className="absolute top-28 -left-4 w-80 h-80 bg-themeYellow rounded-full mix-blend-lighten filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-28 left-40 w-80 h-80 bg-white rounded-full mix-blend-lighten filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-28 left-60 w-80 h-80 bg-bgGradientLighterBLue rounded-full mix-blend-lighten filter blur-xl opacity-40 animate-blob"></div>
      </div>
      <div className="mt-8 md:-mt-20 mb-12">
        <RoundActionCard
          phase={phase}
          roundId={roundId}
          phaseEndsDate={phaseEndsDate}
          phaseEndsDatelabel={phaseEndsDatelabel}
          userRoundDetails={userRoundDetails}
        />
      </div>
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
