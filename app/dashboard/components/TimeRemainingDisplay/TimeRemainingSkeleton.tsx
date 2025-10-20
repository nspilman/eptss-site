export function TimeRemainingSkeleton() {
  return (
    <div className="mb-8 flex items-center justify-center animate-pulse">
      <div className="inline-flex items-center gap-4 px-6 py-3 rounded-lg bg-gray-900/70 border border-gray-800">
        <div className="h-4 w-32 bg-gray-800 rounded"></div>
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-2 py-1 rounded bg-gray-800 border border-gray-700">
              <div className="h-6 w-12 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
