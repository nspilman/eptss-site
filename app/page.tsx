import Head from "next/head";
import { roundManager } from "@/services/roundManager";
import { format } from "date-fns";
import { getUserSession } from "@/components/client/context/userSessionProvider";
import { EmailAuthModalContextProvider } from "@/components/client/context/EmailAuthModalContext";
import { Hero } from "./voting/Homepage/Hero";
import { RoundActionCard } from "./voting/Homepage/RoundActionCard";
import { RoundsDisplay } from "./voting/Homepage/RoundsDisplay";
import { HowItWorks } from "./voting/Homepage/HowItWorks";
import { roundService } from "@/data-access/roundService";

const Homepage = async () => {
  const { data } = await roundService.getCurrentAndPastRounds();

  const phaseMgmtService = await roundManager();
  const { phase, dateLabels, roundId } = phaseMgmtService;

  const roundContent =
    data
      ?.map(({ song, playlistUrl, roundId }) => {
        const { title, artist } = song || { title: null, artist: null };
        return {
          title,
          artist,
          roundId,
          playlistUrl,
        };
      })
      .filter((round) => !(round.roundId === roundId && phase === "signups")) ||
    [];

  const phaseEndsDate = format(
    phaseMgmtService.dates[phase].closes,
    "yyyy-MM-dd"
  );
  const phaseEndsDatelabel = dateLabels[phase].closes;
  const isVotingPhase = phase === "voting";

  const { userRoundDetails } = await getUserSession();
  return (
    <div className="flex flex-col items-center">
      <Head>
        <title>Home | Everyone Plays the Same Song</title>
      </Head>
      <EmailAuthModalContextProvider>
        <Hero phase={phase} roundId={roundId} />
        <div className="pointer-events-none">
          <div className="fixed top-28  md:left-60 w-80 h-80 bg-bgDeepRed rounded-full mix-blend-lighten filter blur-xl opacity-75 animate-blob"></div>
          <div className="fixed top-28  md:left-40 right-24 w-80 h-80 bg-themeYellow rounded-full mix-blend-lighten filter blur-xl opacity-50 animate-blob"></div>
          <div className="fixed top-28 md:-left-4 w-80 h-80 bg-bgGradientLighterBLue rounded-full mix-blend-lighten filter blur-xl animate-blob opacity-750"></div>
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
          rounds={roundContent.map((round) => ({
            playlist: round.playlistUrl || "",
            title: round.title || "",
            artist: round.artist || "",
            roundId: round.roundId,
          }))}
          currentRound={roundId}
          isVotingPhase={isVotingPhase}
        />
        <HowItWorks />
      </EmailAuthModalContextProvider>
    </div>
  );
};

export default Homepage;
