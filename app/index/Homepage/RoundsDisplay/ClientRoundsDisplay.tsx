"use client";

import { RoundCard, Button } from "@/components/ui/primitives";
import { motion } from "framer-motion";
import { Disc, Mic2 } from "lucide-react";
import { useState } from "react";

interface Props {
  rounds: {
    title: string;
    artist: string;
    roundId: number;
    playlistUrl: string;
  }[];
  currentRoundId: number | null;
  isVotingPhase: boolean;
}

export const ClientRoundsDisplay = ({ rounds, currentRoundId, isVotingPhase }: Props) => {
  const [showAllRounds, setShowAllRounds] = useState(false);
  const displayedRounds = showAllRounds 
    ? rounds 
    : rounds.filter(round => currentRoundId ? round.roundId > currentRoundId - 5 : true)

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="max-w-3xl mx-auto w-full"
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-100 flex items-center">
        <Disc className="mr-2 h-7 w-7 text-[#e2e240] animate-spin-slow" />
        Rounds
      </h2>
      <div className="space-y-4">
        {displayedRounds.map((round) => (
          <RoundCard
            key={round.roundId}
            href={`round/${round.roundId}`}
            isActive={currentRoundId === round.roundId}
            className="flex justify-between items-center"
          >
            <span className="text-xl font-semibold text-gray-100 flex items-center">
              <Mic2 className="mr-2 h-5 w-5 text-[#e2e240]" />
              {round.roundId === currentRoundId ? "Current Round: " : ""}
              {round.roundId}. 
              {round.roundId === currentRoundId && isVotingPhase 
                ? " Song selection underway" 
                : <>{round.title} by {round.artist}</>}
            </span>
          </RoundCard>
        ))}
      </div>
      {!showAllRounds && rounds.length > 5 && (
        <div className="mt-6 text-center">
          <Button
            variant="link"
            className="text-[#e2e240] hover:text-[#f0f050]"
            onClick={() => setShowAllRounds(true)}
          >
            View all past rounds
          </Button>
        </div>
      )}
    </motion.div>
  );
};
