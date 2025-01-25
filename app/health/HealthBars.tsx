'use client';

import { useRef, useEffect, useState } from 'react';

type Run = {
  id: string;
  testName: string;
  status: string;
  startedAt: string;
  duration?: number;
  environment: string;
  errorMessage?: string;
};

type Props = {
  runs: Run[];
};

export default function HealthBars({ runs }: Props) {
  const [tooltipPositions, setTooltipPositions] = useState<Record<string, 'left' | 'center' | 'right'>>({});
  const barsRef = useRef<HTMLDivElement>(null);

  const formatDuration = (duration: number) => {
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const updateTooltipPosition = (runId: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const elementRightX = rect.right;
    const spaceToRight = windowWidth - elementRightX;
    const elementCenterX = rect.left + (rect.width / 2);
    const spaceToLeft = elementCenterX;
    
    // If there's less than 260px to the right, position left
    // If there's less than 130px to the left, position right
    // Otherwise center
    if (spaceToRight < 260) {
      setTooltipPositions(prev => ({ ...prev, [runId]: 'right' }));
    } else if (spaceToLeft < 130) {
      setTooltipPositions(prev => ({ ...prev, [runId]: 'left' }));
    } else {
      setTooltipPositions(prev => ({ ...prev, [runId]: 'center' }));
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (barsRef.current) {
        const bars = barsRef.current.querySelectorAll('.health-bar');
        bars.forEach((bar) => {
          updateTooltipPosition(bar.id, bar as HTMLElement);
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex gap-[2px] flex-wrap justify-end mb-4" ref={barsRef}>
      {runs.map((run) => (
        <div
          key={run.id}
          id={run.id}
          className="group relative health-bar"
          onMouseEnter={(e) => updateTooltipPosition(run.id, e.currentTarget)}
        >
          <div
            className={`w-2 h-8 rounded ${
              run.status === 'success'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-red-600 hover:bg-red-700'
            } transition-colors`}
          />
          {/* Tooltip */}
          <div className="absolute bottom-[100%] mb-2 hidden group-hover:block z-50">
            <div className={`relative ${
              tooltipPositions[run.id] === 'left'
                ? 'right-2'
                : tooltipPositions[run.id] === 'right'
                  ? 'translate-x-[-100%] left-4'
                  : 'translate-x-[-50%] left-[1px]'
            }`}>
              <div className="bg-[#0F172A] text-white text-sm rounded-xl py-3 px-4 min-w-[240px] shadow-2xl relative">
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
                {/* Arrow */}
                <div className={`absolute -bottom-1 w-2 h-2 bg-[#0F172A] rotate-45 ${
                  tooltipPositions[run.id] === 'left'
                    ? 'left-[7px]'
                    : tooltipPositions[run.id] === 'right'
                      ? 'right-[7px]'
                      : 'left-1/2 -translate-x-1/2'
                }`}></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
