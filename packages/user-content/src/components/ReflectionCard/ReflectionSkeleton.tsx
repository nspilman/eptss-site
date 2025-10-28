export function ReflectionSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-[var(--color-background-secondary)] rounded-lg border border-[var(--color-gray-800)] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--color-gray-800)] rounded w-1/3"></div>
          <div className="h-4 bg-[var(--color-gray-800)] rounded w-2/3"></div>
          <div className="h-20 bg-[var(--color-gray-800)] rounded"></div>
        </div>
      </div>
    </div>
  );
}
