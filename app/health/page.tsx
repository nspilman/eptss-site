import { monitoringProvider } from "@/providers";
import HealthBars from './HealthBars';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "System Health | Everyone Plays the Same Song",
  description: "System health and monitoring dashboard for Everyone Plays the Same Song platform",
  openGraph: {
    title: "System Health Dashboard | Everyone Plays the Same Song",
    description: "Real-time monitoring and health status of the Everyone Plays the Same Song platform",
  },
};

export default async function HealthPage() {
  const { runs: sortedRuns, latestRuns, successRate, totalRuns } = await monitoringProvider();

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="container mx-auto px-4">
        {/* Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Success Rate */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex items-baseline gap-3">
              <h3 className="text-xl font-semibold text-gray-900">24h Success Rate:</h3>
              <span className="text-2xl font-bold text-gray-900">{successRate.toFixed(1)}%</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Based on {totalRuns} test runs in the last 24 hours</p>
          </div>
          
          {/* Recent Runs */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Recent Test Runs</h3>
            <div className="space-y-1">
              {latestRuns.slice(0, 3).map((run) => (
                <div 
                  key={run.id} 
                  className={`text-sm p-2 rounded ${
                    run.status === 'success' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{run.testName}</span>
                    <span>{new Date(run.startedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test History Grids */}
        <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Test Run History - Last 30 Days</h2>
          <HealthBars runs={sortedRuns} />
        </div>
      </div>
    </div>
  );
}
