"use client";

import { useUserParticipation } from "./UserParticipationContext";
import { RoundInfoHeader } from "./RoundInfoHeader";

interface Props {
  roundId: number;
  song: { title?: string; artist?: string };
  phase: string;
}

export function RoundInfoHeaderWrapper({ roundId, song, phase }: Props) {
  const { hasVoted } = useUserParticipation();

  // For voting phase, show voting results only if user has voted
  const showVotingResults = phase === "voting" && hasVoted;

  return (
    <RoundInfoHeader
      roundId={roundId}
      song={song}
      phase={phase}
      showVotingResults={showVotingResults}
    />
  );
}
