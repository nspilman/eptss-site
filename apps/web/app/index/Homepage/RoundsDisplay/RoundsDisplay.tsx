"use client";

import { useEffect, useState } from "react";
import { ClientRoundsDisplay } from "./ClientRoundsDisplay";
import { Phase } from "@/types";

export const RoundsDisplay = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [rounds, setRounds] = useState([]);
  const [currentRoundId, setCurrentRoundId] = useState<number | null>(null);
  const [isVotingPhase, setIsVotingPhase] = useState(false);
  const [phase, setPhase] = useState<Phase>('signups');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current round data to get phase and currentRoundId
        const currentRoundResponse = await fetch('/api/round/current');
        const currentRoundData = await currentRoundResponse.json();
        
        if (currentRoundData) {
          setCurrentRoundId(currentRoundData.roundId);
          setPhase(currentRoundData.phase);
          setIsVotingPhase(currentRoundData.phase === 'voting');
        }
        
        // Fetch rounds data
        const excludeCurrentRound = currentRoundData?.phase === 'signups';
        const roundsResponse = await fetch(`/api/rounds?excludeCurrentRound=${excludeCurrentRound}`);
        const roundsData = await roundsResponse.json();
        
        setRounds(roundsData.roundContent || []);
      } catch (error) {
        console.error("Error fetching rounds data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <section id="rounds" className="py-16 bg-[var(--color-background-secondary)] rounded-xl">
        <div className="max-w-5xl mx-auto px-4 flex justify-center items-center h-40">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-t-2 border-[var(--color-accent-primary)] rounded-full animate-spin mb-4"></div>
            <p className="text-[var(--color-primary)]">Loading rounds...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="rounds">
      <ClientRoundsDisplay 
        rounds={rounds} 
        currentRoundId={currentRoundId} 
        isVotingPhase={isVotingPhase} 
      />
    </section>
  );
};
