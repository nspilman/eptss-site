export function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-900/50 p-8 mb-8 backdrop-blur-xs border border-gray-800 animate-pulse">
      <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
      <div className="relative z-10">
        <div className="h-10 bg-gray-800 rounded-lg w-3/4 max-w-2xl"></div>
      </div>
    </div>
  );
}
