import { Card } from "@/components/ui/primitives";

export function NextRoundSkeleton() {
  return (
    <Card className="w-full p-8 bg-gray-900/50 border-gray-800 relative overflow-hidden backdrop-blur-xs animate-pulse">
      <div>
        <div className="h-8 bg-gray-800 rounded-lg w-48 mb-6"></div>
        
        <div className="space-y-6">
          <div>
            <div className="h-5 bg-gray-800 rounded w-24 mb-2"></div>
            <div className="h-7 bg-gray-700 rounded w-64"></div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="h-5 bg-gray-800 rounded w-32 mb-2"></div>
              <div className="h-7 bg-gray-700 rounded w-40"></div>
            </div>
            <div>
              <div className="h-5 bg-gray-800 rounded w-32 mb-2"></div>
              <div className="h-7 bg-gray-700 rounded w-40"></div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background-tertiary border border-accent-tertiary">
            <div className="h-6 bg-gray-800 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-4"></div>
            <div className="h-10 bg-gray-800 rounded w-48"></div>
          </div>
        </div>
      </div>
    </Card>
  );
}
