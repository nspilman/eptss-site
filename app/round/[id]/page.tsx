import { Metadata } from 'next';
import { PageTitle } from "@/components/PageTitle";
import { roundProvider, votesProvider, roundsProvider } from "@/providers";
import { getVoteBreakdownBySong } from "@/data-access";
import { RoundSummary } from "./components/RoundSummary";
import { redirect } from 'next/navigation';

export default async function Round({ params }: { params: { id: string } }) {
  // Ensure we have a valid number for the roundId
  if(params.id === "current") {
    // Handle current round differently if needed
    const currentRoundData = await roundProvider();
    return redirect(`/round/${currentRoundData.roundId}`);
  }
  
  const roundId = Number(params.id);
  if (isNaN(roundId)) {
    return (
      <div className="flex flex-col items-center p-8">
        <h1 className="text-2xl font-bold text-red-500">Invalid Round ID</h1>
        <p className="text-white mt-4">The round ID must be a valid number.</p>
      </div>
    );
  }
  
  try {
    // Fetch all data at the page level
    const roundData = await roundProvider(roundId);
    
    // Only fetch additional data if we're past the signup phase
    if (roundData.phase !== "signups") {
      const { voteResults } = await votesProvider({ roundId });
      const { allRoundIds } = await roundsProvider({ excludeCurrentRound: true });
      const voteBreakdown = await getVoteBreakdownBySong(roundId);
      
      return (
        <>
          <PageTitle title={`Round ${params.id} Overview`} />
          <RoundSummary 
            roundId={roundId} 
            roundData={roundData} 
            voteResults={voteResults} 
            roundIds={allRoundIds} 
            voteBreakdown={voteBreakdown} 
          />
        </>
      );
    }
    
    // For signup phase, we only need the basic round data
    return (
      <>
        <PageTitle title={`Round ${params.id} Overview`} />
        <RoundSummary 
          roundId={roundId} 
          roundData={roundData} 
        />
      </>
    );
  } catch (error) {
    console.error('Error loading round data:', error);
    return (
      <div className="flex flex-col items-center p-8">
        <h1 className="text-2xl font-bold text-red-500">Error Loading Round</h1>
        <p className="text-white mt-4">There was a problem loading this round&apos;s data. Please try again later.</p>
      </div>
    );
  }
}



export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const roundId = Number(params.id);
  
  if (isNaN(roundId)) {
    return {
      title: "Invalid Round | Everyone Plays the Same Song",
      description: "This page contains an invalid round ID. Please navigate to a valid round.",
    };
  }
  
  try {
    const round = await roundProvider(roundId);
    
    return {
      title: round.song?.title 
        ? `Round ${roundId} - ${round.song.title} by ${round.song.artist} | Everyone Plays the Same Song`
        : `Round ${roundId} | Everyone Plays the Same Song`,
      description: round.song?.title 
        ? `Listen to community covers of "${round.song.title} by ${round.song.artist}" in Round ${roundId} of Everyone Plays the Same Song. Experience unique interpretations from our talented participants.`
        : `Join Round ${roundId} of Everyone Plays the Same Song - where our community comes together to cover the same song in their own unique style.`,
      openGraph: {
        title: round.song?.title 
          ? `Round ${roundId} - ${round.song.title} by ${round.song.artist} | Everyone Plays the Same Song`
          : `Round ${roundId} | Everyone Plays the Same Song`,
        description: round.song?.title 
          ? `Listen to community covers of "${round.song.title} by ${round.song.artist}" in Round ${roundId} of Everyone Plays the Same Song. Experience unique interpretations from our talented participants.`
          : `Join Round ${roundId} of Everyone Plays the Same Song - where our community comes together to cover the same song in their own unique style.`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata for round:", error);
    return {
      title: "Round Error | Everyone Plays the Same Song",
      description: "There was an error loading this round. Please try again later.",
    };
  }
}
