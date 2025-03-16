'use client';

import { useRef } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';

type Run = {
  id: string;
  testName: string;
  status: string;
  startedAt: string;
  duration: number | null;
  environment: string;
  errorMessage: string | null;
};

type Props = {
  runs: Run[];
};

export default function HealthBars({ runs }: Props) {
  const barsRef = useRef<HTMLDivElement>(null);

  const formatDuration = (duration: number) => {
    return `${(duration / 1000).toFixed(1)}s`;
  };

  // Group runs by test name
  const runsByTest = runs.reduce((acc, run) => {
    if (!acc[run.testName]) {
      acc[run.testName] = [];
    }
    acc[run.testName].push(run);
    return acc;
  }, {} as Record<string, Run[]>);

  return (
    <div className="space-y-8" ref={barsRef}>
      {Object.entries(runsByTest).map(([testName, testRuns]) => (
        <div key={testName} className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">{testName}</h3>
          <div className="flex gap-[2px] flex-wrap justify-end">
            {testRuns.map((run) => (
              <TooltipProvider key={run.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      id={run.id}
                      className="health-bar"
                    >
                      <div
                        className={`w-2 h-8 rounded ${
                          run.status === 'success'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-red-600 hover:bg-red-700'
                        } transition-colors`}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    align="center" 
                    className="bg-[var(--color-gray-900)] text-[var(--color-white)] text-sm rounded-xl py-3 px-4 min-w-[240px] shadow-2xl z-50"
                    sideOffset={5}
                  >
                    <div className="text-lg mb-3">{run.testName}</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={run.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                          {run.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Time:</span>
                        <span className="text-white">{new Date(run.startedAt).toLocaleString()}</span>
                      </div>
                      {run.duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white">{formatDuration(run.duration)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Environment:</span>
                        <span className="text-white">{run.environment}</span>
                      </div>
                    </div>
                    {run.errorMessage && (
                      <div className="mt-3 pt-2 border-t border-gray-700">
                        <div className="text-red-400 font-medium mb-1">Error:</div>
                        <div className="text-gray-300 break-words text-sm">
                          {run.errorMessage}
                        </div>
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
