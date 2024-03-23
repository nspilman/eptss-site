import { Hero } from "../components/Homepage/Hero";
import { HowItWorks } from "../components/Homepage/HowItWorks";
import Head from "next/head";
import { getNewPhaseManager } from "services/PhaseMgmtService";
import { RoundsDisplay } from "../components/Homepage/RoundsDisplay";
import { RoundActionCard } from "../components/Homepage/RoundActionCard";
import { Tables, getCurrentRoundId } from "queries";
import { format } from "date-fns";
import { EmailAuthModalContextProvider } from "components/context/EmailAuthModal";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getUserSession } from "@/components/context/getUserSession";

const Homepage = async () => {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data, error } = await supabase
    .from(Tables.RoundMetadata)
    .select(
      `playlist_url, 
      id, 
      song_id,
      song:songs (
      title, 
      artist
    )`
    )
    .filter("id", "lte", await getCurrentRoundId())
    .order("id", { ascending: false });
  if (error) {
    throw new Error(JSON.stringify(error));
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const phaseMgmtService = await getNewPhaseManager();
  const { phase, dateLabels, roundId } = phaseMgmtService;

  const roundContent = data
    .map(({ song, playlist_url, id }) => {
      const { title, artist } = song || { title: null, artist: null };
      return {
        title,
        artist,
        roundId: id,
        playlist: playlist_url,
      };
    })
    .filter((round) => !(round.roundId === roundId && phase === "signups"));

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
            session={session}
            userRoundDetails={userRoundDetails}
          />
        </div>
        <RoundsDisplay
          rounds={roundContent.map((round) => ({
            playlist: round.playlist || "",
            title: round.title || "",
            artist: round.artist || "",
            roundId: round.roundId,
          }))}
          currentRound={roundId}
          isVotingPhase={isVotingPhase}
        />
        <HowItWorks />
      </EmailAuthModalContextProvider>
      {/* </UserSessionProvider> */}
    </div>
  );
};

export default Homepage;
