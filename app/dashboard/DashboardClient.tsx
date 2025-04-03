"use client";

import { Button, Card } from "@/components/ui/primitives";
import Link from "next/link";
import { Navigation } from "@/enum/navigation";
import { Phase, RoundInfo } from "@/types/round";
import { UserRoundParticipation } from "@/types/user";
import { useEffect, useState } from "react";
import { formatDate, formatTimeRemaining } from '@/services/dateService';

interface DashboardClientProps {
  roundInfo: RoundInfo | null;
  userRoundDetails?: UserRoundParticipation;
  verificationStatus?: {
    verified: boolean;
    message?: string;
  };
}

// Helper functions for phase management
const getPhaseTitle = (phase: Phase) => {
  switch (phase) {
    case "signups":
      return "Song Selection & Signups";
    case "covering":
      return "Covering";
    case "voting":
      return "Community Voting";
    case "celebration":
      return "Round Celebration";
    default:
      return "Current Phase";
  }
};

const getNextPhase = (currentPhase: Phase): Phase => {
  const phaseTransitions: Record<Phase, Phase> = {
    signups: "covering",
    covering: "voting",
    voting: "celebration",
    celebration: "signups",
  };

  return phaseTransitions[currentPhase];
};

const getPhaseCompletionStatus = (
  phase: Phase,
  isParticipating: boolean,
  userRoundDetails: UserRoundParticipation
): boolean => {
  if (!isParticipating) return false;

  const completionMap: Record<Phase, boolean> = {
    signups: userRoundDetails.hasSignedUp,
    covering: userRoundDetails.hasSubmitted,
    voting: userRoundDetails.hasVoted,
    celebration: true, // Celebration phase is always considered complete if participating
  };

  return completionMap[phase];
};

const getActionButton = (
  phase: Phase,
  hasCompleted: boolean,
  roundId: number
): { text: string; href: string } | null => {
  switch (phase) {
    case "signups":
      return {
        text: hasCompleted ? "Update Song Suggestion" : "Suggest a Song",
        href: Navigation.SignUp,
      };
    case "covering":
      return {
        text: hasCompleted ? "Update Submission" : "Submit Cover",
        href: Navigation.Submit,
      };
    case "voting":
      return {
        text: hasCompleted ? "Update Votes" : "Cast Votes",
        href: Navigation.Voting,
      };
    case "celebration":
      return {
        text: "View Round Results",
        href: `/round/${roundId}`,
      };
    default:
      return null;
  }
};

export function DashboardClient({ roundInfo, userRoundDetails, verificationStatus }: DashboardClientProps) {
  const [timeRemaining, setTimeRemaining] = useState("");
  useEffect(() => {
    if (!roundInfo?.dateLabels[roundInfo.phase]?.closes) {
      setTimeRemaining('NaN NaN NaN');
      return;
    }

    const updateTimer = () => {
      const remaining = formatTimeRemaining(roundInfo.dateLabels[roundInfo.phase].closes);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [roundInfo]);

  console.log({ roundInfo, userRoundDetails })

  if (!roundInfo || !userRoundDetails) {
    return <div>Loading...</div>;
  }

  const {
    roundId,
    phase,
    song,
    dateLabels,
  } = roundInfo;

  const isParticipating = userRoundDetails.hasSignedUp;
  const hasCompletedCurrentPhase = getPhaseCompletionStatus(phase, isParticipating, userRoundDetails);

  const currentPhaseEndDate = dateLabels[phase]?.closes;
  const nextPhase = getNextPhase(phase);

  const nextPhaseStartDate = dateLabels[nextPhase]?.opens;

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gray-900/50 p-8 mb-8 backdrop-blur-xs border border-gray-800">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
              Round {roundId}: {song.title ? `${song.title} by ${song.artist}` : "Song Selection in Progress"}
            </span>
          </h1>
        </div>
      </div>
      
      {/* Verification Status Notification */}
      {verificationStatus?.message && (
        <div className={`mb-8 rounded-lg p-6 backdrop-blur-sm ${verificationStatus.verified ? 'bg-background-tertiary' : 'bg-background-error'}`}>
          <div className={`border-l-4 pl-4 ${verificationStatus.verified ? 'border-accent-primary' : 'border-accent-error'}`}>
            <h3 className="text-xl font-medium font-fraunces text-primary">
              {verificationStatus.verified ? 'Signup Verified' : 'Verification Issue'}
            </h3>
            <p className="mt-1 text-sm text-accent-primary opacity-90">
              {verificationStatus.message}
            </p>
          </div>
        </div>
      )}

      {/* Time Remaining Display */}
      {currentPhaseEndDate && (
        <div className="mb-8 flex items-center justify-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-lg bg-gray-900/70 border border-gray-800">
            <span className="text-sm font-medium text-gray-300">Time Remaining</span>
            <div className="flex items-center gap-3">
              {timeRemaining.split(' ').map((part, index) => {
                const [value, unit] = part.split(/([a-z]+)/);
                return (
                  <div key={index} className="px-2 py-1 rounded bg-gray-800 border border-gray-700">
                    <span className="text-lg font-bold text-gray-300">{value}</span>
                    <span className="text-sm text-[var(--color-accent-primary)] ml-1">{unit}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Current Round Status */}
      <Card className="w-full p-8 bg-gray-900/50 border-gray-800 relative overflow-hidden backdrop-blur-xs mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-8 text-gray-300">Current Round Progress</h2>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-[var(--color-accent-primary)] mb-2 text-lg">Phase</p>
                <p className="text-xl text-gray-300 font-medium">{getPhaseTitle(phase)}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[var(--color-accent-primary)] mb-2 text-lg">Deadline</p>
                <p className="text-xl text-gray-300 font-medium">
                  {currentPhaseEndDate ? formatDate.v(currentPhaseEndDate) : "TBD"}
                </p>
              </div>
            </div>
          </div>

            <div className="mt-12 flex flex-col items-center p-10 bg-gray-900/70 rounded-lg border border-gray-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
              <div className="relative z-10 flex flex-col items-center w-full max-w-md">
                {/* <h3 className="text-lg font-medium text-gray-300 mb-4">Ready to participate?</h3> */}
                {isParticipating && (() => {
                  // Cache the action button to avoid multiple function calls
                  const actionButton = getActionButton(phase, hasCompletedCurrentPhase, roundId);
                  return actionButton && (
                    <Button
                      size="lg"
                      variant="default"
                      className="w-full sm:w-auto px-8 py-6 text-lg font-bold bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/90 text-gray-900 border-none shadow-lg shadow-[var(--color-accent-primary)]/20 hover:shadow-[var(--color-accent-primary)]/30 transition-all"
                      asChild
                    >
                      <Link href={actionButton.href}>
                        {actionButton.text}
                      </Link>
                    </Button>
                  );
                })()
                }

                {(!isParticipating && phase === "signups") && (
                  <Button
                    size="lg"
                    variant="default"
                    className="w-full sm:w-auto bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/90 text-gray-900 border-none shadow-lg shadow-[var(--color-accent-primary)]/20 hover:shadow-[var(--color-accent-primary)]/30 transition-all"
                    asChild
                  >
                    <Link href={Navigation.SignUp}>
                      Sign Up for Round {roundId}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
    </div>
  );
}
