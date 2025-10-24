"use client";

import { Card, Button } from "@eptss/ui";
import { RoundInfo } from "@/types/round";
import { useState } from "react";
import Link from "next/link";

interface RoundTimelineProps {
  rounds: RoundInfo[];
}

export function RoundTimeline({ rounds }: RoundTimelineProps) {
  const [selectedRound, setSelectedRound] = useState<RoundInfo | null>(null);
  return (
    <div className="relative w-full overflow-hidden">
      {/* Timeline Track */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-[#3B3852]" />

      {/* Timeline Content */}
      <div className="relative flex flex-row-reverse items-center gap-8 py-8 overflow-x-auto px-8 min-w-full">
        {rounds.map((round) => (
          <div key={round.roundId} className="shrink-0">
            <button
              onClick={() => setSelectedRound(round)}
              className={`relative flex flex-col items-center transition-all ${
                selectedRound?.roundId === round.roundId
                  ? "scale-110 -translate-y-2"
                  : "hover:scale-105 hover:-translate-y-1"
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-[#2D2A3E] border-2 border-[#3B3852] flex items-center justify-center mb-2 shadow-lg">
                <span className="text-lg font-bold text-[#8B7EF8]">#{round.roundId}</span>
              </div>
              <span className="text-sm text-[#B4B0C5] font-medium">{round.song.title}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Selected Round Details */}
      {selectedRound && (
        <Card className="mt-8 p-6 bg-[#1E1B2E] border-[#2D2A3E] shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10 pointer-events-none" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-[#8B7EF8] relative z-10">
                Round #{selectedRound.roundId}: {selectedRound.song.title}
              </h3>
              <p className="text-[#B4B0C5] relative z-10">by {selectedRound.song.artist}</p>
            </div>
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/round/${selectedRound.slug || selectedRound.roundId}`}>
                View Details
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 relative z-10">
            <div>
              <p className="text-[#8B7EF8] mb-1">Phase</p>
              <p className="font-medium text-[#B4B0C5]">Completed</p>
            </div>
            <div>
              <p className="text-[#8B7EF8] mb-1">Participants</p>
              <p className="font-medium text-[#B4B0C5]">
                {selectedRound.signupCount || 0} Signups • {selectedRound.submissionCount || 0} Submissions
              </p>
            </div>
          </div>
          
          {/* Debug info */}
          <div className="mt-4 p-2 bg-[#2D2A3E] rounded text-xs text-[#8B7EF8] relative z-10">
            <p>Debug: signupCount={JSON.stringify(selectedRound.signupCount)}, submissionCount={JSON.stringify(selectedRound.submissionCount)}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
