import { roundProvider } from "@/providers";

export async function DashboardHero() {
  const currentRound = await roundProvider();

  if (!currentRound) {
    return null;
  }

  const { roundId, song } = currentRound;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-900/50 p-8 mb-8 backdrop-blur-xs border border-gray-800">
      <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-10" />
      <div className="relative z-10">
        <h1 className="text-4xl font-bold">
          <span className="bg-clip-text text-transparent bg-linear-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
            Round {roundId}: {song.title ? `${song.title} by ${song.artist}` : "Song Selection in Progress"}
          </span>
        </h1>
      </div>
    </div>
  );
}
