import { Metadata } from 'next';
import { PageTitle } from "@/components/PageTitle";
import { roundProvider, votesProvider, roundsProvider } from "@/providers";
import { getVoteBreakdownBySong } from "@/data-access";
import { RoundSummary } from "./components/RoundSummary";
import { redirect } from 'next/navigation';

export default async function Round({ params }: { params: { slug: string } }) {
  // Handle current round differently if needed
  if(params.slug === "current") {
    // Get the current round and redirect to its slug
    const currentRoundData = await roundProvider();
    return redirect(`/round/${currentRoundData.slug || currentRoundData.roundId}`);
  }
  
  try {
    // Use the slug parameter directly
    const slug = params.slug;
    
    // Fetch all data at the page level
    const roundData = await roundProvider(slug);
    
    // Only fetch additional data if we're past the signup phase
    if (roundData.phase !== "signups") {
      const { voteResults } = await votesProvider({ roundId: roundData.roundId });
      const { allRoundIds } = await roundsProvider({ excludeCurrentRound: true });
      const voteBreakdown = await getVoteBreakdownBySong(roundData.roundId);
      
      return (
        <>
          <PageTitle title={`Round ${roundData.roundId} Overview`} />
          <RoundSummary 
            roundId={roundData.roundId} 
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
        <PageTitle title={`Round ${roundData.roundId} Overview`} />
        <RoundSummary 
          roundId={roundData.roundId} 
          roundData={roundData} 
        />
      </>
    );
  } catch (error) {
    console.error("Error in round page:", error);
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Round Not Found</h1>
        <p>Sorry, we couldn't find the round you're looking for.</p>
      </div>
    );
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Handle current round differently if needed
  if(params.slug === "current") {
    return {
      title: "Current Round | Everyone Plays the Same Song",
      description: "Details about the current round of Everyone Plays the Same Song."
    };
  }

  try {
    const roundData = await roundProvider(params.slug);
    
    let title = `Round ${roundData.roundId}`;
    let description = "Everyone Plays the Same Song round details.";
    
    if (roundData.song?.title && roundData.song?.artist) {
      title = `${roundData.song.title} by ${roundData.song.artist} | Round ${roundData.roundId}`;
      description = `Check out Round ${roundData.roundId} of Everyone Plays the Same Song, featuring ${roundData.song.title} by ${roundData.song.artist}.`;
    }
    
    return {
      title: `${title} | Everyone Plays the Same Song`,
      description,
      openGraph: {
        title: `${title} | Everyone Plays the Same Song`,
        description,
        images: [
          {
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
            width: 1200,
            height: 630,
            alt: "Everyone Plays the Same Song Community",
          },
        ],
      },
    };
  } catch (error) {
    return {
      title: "Round | Everyone Plays the Same Song",
      description: "Details about a round of Everyone Plays the Same Song."
    };
  }
}
