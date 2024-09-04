import Head from "next/head";
import { roundProvider, userParticipationProvider } from "@/providers";
import { format } from "date-fns";
import { Hero } from "./index/Homepage/Hero";
import { RoundActionCard } from "./index/Homepage/RoundActionCard";
import { RoundsDisplay } from "./index/Homepage/RoundsDisplay";
import { HowItWorks } from "./index/Homepage/HowItWorks";
import * as React from "react"
import { ClientPage } from "./ClientPage";


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
    <ClientPage/>
    </div>
      )};

export default Homepage;
