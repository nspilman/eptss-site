import { getMonitoringData } from "@/data-access";

export default async function HealthPage() {
  const { runs, latestRuns, successRate, totalRuns } = await getMonitoringData();

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Sort runs from oldest to newest
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
          <div className="flex gap-[2px] flex-wrap justify-end mb-4">
            {sortedRuns.map((run, index) => (
              <div
                key={run.id}
                className="group relative"
              >
                <div
                  className={`w-2 h-8 rounded ${
                    run.status === 'success'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } transition-colors`}
                />
                {/* Tooltip */}
                <div className="absolute bottom-[100%] left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                  <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 min-w-[240px] shadow-xl relative">
                    <div className="font-medium mb-2">{run.testName}</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Status:</span>
                        <span className={run.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                          {run.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Time:</span>
                        <span className="text-white">{new Date(run.startedAt).toLocaleString()}</span>
                      </div>
                      {run.duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-300">Duration:</span>
                          <span className="text-white">{formatDuration(run.duration)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-300">Environment:</span>
                        <span className="text-white">{run.environment}</span>
                      </div>
                    </div>
                    {run.errorMessage && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <div className="text-red-400 font-medium mb-1">Error:</div>
                        <div className="text-gray-300 break-words text-sm">
                          {run.errorMessage}
                        </div>
                      </div>
                    )}
                    {/* Arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
