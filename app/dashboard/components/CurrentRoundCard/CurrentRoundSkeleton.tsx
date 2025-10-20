import { Card } from "@/components/ui/primitives";

export function CurrentRoundSkeleton() {
  return (
    <Card className="w-full p-8 bg-gray-900/50 border-gray-800 relative overflow-hidden backdrop-blur-xs mb-8 animate-pulse">
      <div>
        <div className="h-8 bg-gray-800 rounded-lg w-64 mb-8"></div>
        
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <div className="h-5 bg-gray-800 rounded w-20 mb-2"></div>
              <div className="h-7 bg-gray-700 rounded w-48"></div>
            </div>
            <div>
              <div className="h-5 bg-gray-800 rounded w-32 mb-2"></div>
              <div className="h-7 bg-gray-700 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="h-5 bg-gray-800 rounded w-24 mb-2"></div>
              <div className="h-7 bg-gray-700 rounded w-40"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center p-10 bg-gray-900/70 rounded-lg border border-gray-800">
          <div className="h-12 bg-gray-800 rounded-lg w-48"></div>
        </div>
      </div>
    </Card>
  );
}
