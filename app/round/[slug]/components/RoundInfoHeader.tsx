import React from "react";

interface RoundInfoHeaderProps {
  roundId: number;
  song: { title?: string; artist?: string };
  phase: string;
  showVotingResults: boolean;
}

export const RoundInfoHeader = ({ roundId, song, phase, showVotingResults }: RoundInfoHeaderProps) => (
  <div className="pb-4 text-center">
    <h1 className="font-fraunces text-white font-semibold text-lg pb-1">
      Round {roundId} Info
    </h1>
    {!(phase === "voting" && showVotingResults) && phase !== "voting" && (
      <h2 className="font-fraunces text-white font-bold text-xl">
        {song?.title || ""} by {song?.artist || ""}
      </h2>
    )}
  </div>
);
