"use client";

import { useUserParticipation } from "./UserParticipationContext";
import { CoveringPhaseSignup } from "./CoveringPhaseSignup";

interface Props {
  roundId: number;
}

export function CoveringPhaseSignupWrapper({ roundId }: Props) {
  const { hasSignedUp, isLoading } = useUserParticipation();

  // Show loading skeleton while fetching user state
  if (isLoading) {
    return (
      <div className="mt-4 flex flex-col items-center animate-pulse">
        <div className="h-10 w-48 bg-gray-700/50 rounded"></div>
      </div>
    );
  }

  return <CoveringPhaseSignup roundId={roundId} isSignedUp={hasSignedUp} />;
}
