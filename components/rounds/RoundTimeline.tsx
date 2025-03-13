"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-l from-purple-500 via-blue-500 to-indigo-500" />

      {/* Timeline Content */}
      <div className="relative flex flex-row-reverse items-center gap-8 py-8 overflow-x-auto px-8 min-w-full">
        {rounds.map((round) => (
          <div key={round.roundId} className="flex-shrink-0">
            <button
              onClick={() => setSelectedRound(round)}
              className={`relative flex flex-col items-center transition-all ${
                selectedRound?.roundId === round.roundId
                  ? "scale-110 -translate-y-2"
                  : "hover:scale-105 hover:-translate-y-1"
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 border-2 border-purple-400 flex items-center justify-center mb-2 shadow-lg shadow-purple-500/20">
                <span className="text-lg font-bold text-white">#{round.roundId}</span>
              </div>
              <span className="text-sm text-white font-medium">{round.song.title}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Selected Round Details */}
      {selectedRound && (
        <Card className="mt-8 p-6 bg-gradient-to-br from-purple-900/80 to-blue-900/80 border border-purple-500/30 backdrop-blur-sm shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-white">
                Round #{selectedRound.roundId}: {selectedRound.song.title}
              </h3>
              <p className="text-purple-200">by {selectedRound.song.artist}</p>
            </div>
            <Button variant="secondary" size="sm" asChild className="bg-purple-500/20 hover:bg-purple-500/30 text-white border-purple-400/30">
              <Link href={`/round/${selectedRound.roundId}`}>
                View Details
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-purple-200 mb-1">Phase</p>
              <p className="font-medium text-white">Completed</p>
            </div>
            <div>
              <p className="text-purple-200 mb-1">Participants</p>
              <p className="font-medium text-white">12 Musicians</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
