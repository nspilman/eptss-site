import React from "react";
import {
  roundProvider,
  userParticipationProvider,
} from "@/providers";
import {VotingPage} from "./VotingPage";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Vote on Covers | Everyone Plays the Same Song",
  description: "Listen and vote on community-submitted cover versions. Help choose the standout performances in this round of Everyone Plays the Same Song.",
  openGraph: {
    title: "Vote on Covers | Everyone Plays the Same Song",
    description: "Listen and vote on community-submitted cover versions. Help choose the standout performances in this round of Everyone Plays the Same Song.",
  },
};

import VotingPageWrapper from "./VotingPageWrapper";

interface Props {
  searchParams?: { [key: string]: string | string[] | undefined };
}

const VotingPageHome = async ({ searchParams }: Props) => {
  return <VotingPageWrapper searchParams={searchParams} />;
};

export default VotingPageHome;
