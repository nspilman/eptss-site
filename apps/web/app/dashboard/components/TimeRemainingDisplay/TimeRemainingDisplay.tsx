"use client";

import { useEffect, useState } from "react";
import { formatTimeRemaining } from '@/services/dateService';
import { Phase } from "@eptss/data-access/types/round";

interface TimeRemainingDisplayProps {
  phaseCloses: string;
  currentPhase: Phase;
}

export function TimeRemainingDisplay({ phaseCloses, currentPhase }: TimeRemainingDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    if (!phaseCloses) {
      setTimeRemaining('NaN NaN NaN');
      return;
    }

    const updateTimer = () => {
      const remaining = formatTimeRemaining(phaseCloses);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [phaseCloses]);

  if (!timeRemaining || timeRemaining === 'NaN NaN NaN') {
    return null;
  }

  return (
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
  );
}
