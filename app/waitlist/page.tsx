import { roundProvider } from "@/providers";
import { WaitlistForm } from "./WaitlistForm";

export default async function WaitlistPage() {
  const currentRound = await roundProvider();
  const nextRound = await roundProvider(currentRound.roundId + 1);
  
  const roundToDisplay = currentRound.hasRoundStarted ? nextRound : currentRound;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Join the Waitlist</h1>
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl mb-4">
            Next Round: {roundToDisplay.roundId}
          </h2>
          {roundToDisplay.song.title && (
            <p className="text-gray-300">
              Song: {roundToDisplay.song.title} by {roundToDisplay.song.artist}
            </p>
          )}
        </div>
        <div className="space-y-4">
          <p className="text-gray-300">
            Join our waitlist to be notified when spots open up in future rounds. 
            We&apos;ll email you as soon as registration becomes available.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </div>
  );
} 