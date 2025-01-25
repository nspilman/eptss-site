import { getMonitoringData } from "@/data-access";
import { useRef, useEffect, useState } from 'react';
import HealthBars from './HealthBars';

export default async function HealthPage() {
  const { runs, latestRuns, successRate, totalRuns } = await getMonitoringData();

  // Sort runs by date
  const sortedRuns = [...runs].sort((a, b) =>
    new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">System Health</h1>
        
        {/* Test Run History Grid */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Test Run History - Last 30 Days</h2>
          <HealthBars runs={sortedRuns} />
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700">Each bar represents one test run. Hover for details.</span>
            <span className="text-gray-600 font-medium">← Older | Newer →</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* 24 Hour Stats */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">24 Hour Success Rate</h2>
            <div className="text-5xl font-bold text-gray-900">
              {successRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-2 font-medium">
              Based on {totalRuns} test {totalRuns === 1 ? 'run' : 'runs'} in the last 24 hours
            </div>
          </div>

          {/* Recent Test Runs */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Test Runs</h2>
            <div className="space-y-3">
              {latestRuns?.map((run) => (
                <div 
                  key={run.id} 
                  className={`p-4 rounded-lg border ${
                    run.status === 'success'
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900">
                      {run.testName}
                    </div>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      run.status === 'success'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {run.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(run.startedAt).toLocaleString()}
                  </div>
                  {run.error && (
                    <div className="mt-2 text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200">
                      {run.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
