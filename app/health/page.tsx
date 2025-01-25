import { getMonitoringData } from "@/data-access";

export default async function HealthPage() {
  const { latestRuns, successRate, totalRuns } = await getMonitoringData();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">System Health</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">24 Hour Success Rate</h2>
        <div className="text-4xl font-bold text-blue-600">
          {successRate.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Based on {totalRuns} test runs in the last 24 hours
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Test Runs</h2>
        <div className="space-y-4">
          {latestRuns?.map((run) => (
            <div 
              key={run.id} 
              className={`p-4 rounded-lg ${
                run.status === 'passed' 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}
            >
              <div className="font-semibold">{run.testName}</div>
              <div className="text-sm text-gray-600">
                {new Date(run.startedAt).toLocaleString()}
              </div>
              {run.errorMessage && (
                <div className="mt-2 text-sm text-red-600">
                  {run.errorMessage}
                </div>
              )}
              <div className="text-sm text-gray-600">
                Duration: {run.duration}ms
              </div>
              <div className="text-xs text-gray-500">
                Environment: {run.environment}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
