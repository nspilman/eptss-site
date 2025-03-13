"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Navigation } from "@/enum/navigation";
import { Phase, RoundInfo } from "@/types/round";
import { UserRoundParticipation } from "@/types/user";
import { useEffect, useState } from "react";
import { RoundTimeline } from "@/components/rounds/RoundTimeline";

import { formatDate, formatTimeRemaining } from '@/services/dateService';

const getPhaseTitle = (phase: Phase) => {
  switch (phase) {
    case "signups":
      return "Song Selection & Signups";
    case "covering":
      return "Cover Creation";
    case "voting":
      return "Community Voting";
    case "celebration":
      return "Round Celebration";
    default:
      return "Current Phase";
  }
};

interface DashboardClientProps {
  roundInfo: RoundInfo | null;
  userRoundDetails: UserRoundParticipation | null;
}

export function DashboardClient({ roundInfo, userRoundDetails }: DashboardClientProps) {
  console.log({roundInfo, userRoundDetails})
  const [timeRemaining, setTimeRemaining] = useState("");

  console.log({timeRemaining})

  useEffect(() => {
    if (!roundInfo?.dateLabels[roundInfo.phase]?.closes) {
      setTimeRemaining('NaN NaN NaN');
      return;
    }

    const updateTimer = () => {
      const remaining = formatTimeRemaining(roundInfo.dateLabels[roundInfo.phase].closes);
      console.log({remaining})
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [roundInfo]);

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
  const hasCompletedCurrentPhase = isParticipating && {
    signups: userRoundDetails.hasSignedUp,
    covering: userRoundDetails.hasSubmitted,
    voting: userRoundDetails.hasVoted,
    celebration: true,
  }[phase];

  const currentPhaseEndDate = dateLabels[phase]?.closes;
  const nextPhase = {
    signups: "covering",
    covering: "voting",
    voting: "celebration",
    celebration: "signups",
  }[phase] as Phase;
  
  const nextPhaseStartDate = dateLabels[nextPhase]?.opens;

  const getActionButton = (phase: Phase, hasCompleted: boolean) => {
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

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-[#1E1B2E] p-8 mb-8">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-[#8B7EF8]">
            Round {roundId}: {song.title ? `${song.title} by ${song.artist}` : "Song Selection in Progress"}
          </h1>
        </div>
      </div>

      {/* Time Remaining Display */}
      {currentPhaseEndDate && (
        <div className="mb-8 flex items-center justify-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-lg bg-[#2D2A3E] border border-[#3B3852]">
            <span className="text-sm font-medium text-[#B4B0C5]">Time Remaining</span>
            <div className="flex items-center gap-3">
              {timeRemaining.split(' ').map((part, index) => {
                const [value, unit] = part.split(/([a-z]+)/);
                return (
                  <div key={index} className="px-2 py-1 rounded bg-[#3B3852] border border-[#4A466B]">
                    <span className="text-lg font-bold text-[#B4B0C5]">{value}</span>
                    <span className="text-sm text-[#8B7EF8] ml-1">{unit}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Current Round Status */}
        <Card className="col-span-2 p-6 bg-[#1E1B2E] border-[#2D2A3E] relative overflow-hidden">
          
          <div>
            <h2 className="text-xl font-semibold mb-6 text-[#B4B0C5]">Current Round Progress</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-[#8B7EF8] mb-1">Phase</p>
                  <p className="text-md text-[#B4B0C5]">{getPhaseTitle(phase)}</p>
                </div>
                <div>
                  <p className="text-[#8B7EF8] mb-1">Deadline</p>
                  <p className="text-md text-[#B4B0C5]">
                    {currentPhaseEndDate ? formatDate.v(currentPhaseEndDate) : "TBD"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[#8B7EF8] mb-1">Next Phase</p>
                  <p className="text-md text-[#B4B0C5]">{getPhaseTitle(nextPhase)}</p>
                </div>
                <div>
                  <p className="text-[#8B7EF8] mb-1">Starts</p>
                  <p className="text-md text-[#B4B0C5]">
                    {nextPhaseStartDate ? formatDate.v(nextPhaseStartDate) : "TBD"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center p-8 bg-[#2D2A3E] rounded-lg border border-[#3B3852] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
            <div className="relative z-10 flex flex-col items-center">
              <h3 className="text-lg font-medium text-[#B4B0C5] mb-4">Ready to participate?</h3>
            {isParticipating && getActionButton(phase, hasCompletedCurrentPhase) && (
              <Button 
                size="xl"
                variant="gradient"
                className="w-full sm:w-auto bg-[#8B7EF8] hover:bg-[#7B6EE8] text-white border-none shadow-lg shadow-[#8B7EF8]/20 hover:shadow-[#8B7EF8]/30 transition-all"
                asChild
              >
                <Link href={getActionButton(phase, hasCompletedCurrentPhase)!.href}>
                  {getActionButton(phase, hasCompletedCurrentPhase)!.text}
                </Link>
              </Button>
            )}
            
            {(!isParticipating && phase === "signups") && (
              <Button 
                size="xl"
                variant="gradient"
                className="w-full sm:w-auto bg-[#8B7EF8] hover:bg-[#7B6EE8] text-white border-none shadow-lg shadow-[#8B7EF8]/20 hover:shadow-[#8B7EF8]/30 transition-all"
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

        {/* Your Participation */}
        <Card className="p-6 bg-[#1E1B2E] border-[#2D2A3E] relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
          <h2 className="text-xl font-semibold mb-6 relative z-10 text-[#B4B0C5]">Your Progress</h2>
          <div className="space-y-6 relative z-10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#B4B0C5] font-medium">Status</p>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  isParticipating 
                    ? 'bg-[#1E3A2F] text-[#4ADE80] border border-[#2E5C48]' 
                    : 'bg-[#2D2A3E] text-[#B4B0C5] border border-[#3B3852]'
                }`}>
                  {isParticipating ? "Participating" : "Not Participating"}
                </span>
              </div>
              {isParticipating && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-[#B4B0C5] font-medium">Phase Progress</p>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    hasCompletedCurrentPhase 
                      ? 'bg-[#1E2D3A] text-[#4AB8DE] border border-[#2E4C5C]' 
                      : 'bg-[#3A2E1E] text-[#DEB04A] border border-[#5C4C2E]'
                  }`}>
                    {hasCompletedCurrentPhase ? "Completed" : "Pending"}
                  </span>
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              className="w-full border-[#2D2A3E] text-[#B4B0C5] hover:bg-[#2D2A3E] hover:text-[#8B7EF8]" 
              asChild
            >
              <Link href={`/round/${roundId}`}>
                View Full Round Details
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
