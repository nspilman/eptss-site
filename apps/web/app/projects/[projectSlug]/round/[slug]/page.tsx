import { Metadata } from 'next';
import { PageTitle } from "@/components/PageTitle";
import { roundProvider, votesProvider, roundsProvider, userParticipationProvider, getProjectIdFromSlug, type ProjectSlug } from "@eptss/data-access";
import { getCurrentPhase } from "@eptss/data-access/services/dateService";
import { RoundSummary } from "./components/RoundSummary";
import { redirect } from 'next/navigation';
import { RoundParamsProvider } from '../../ProjectContext';

import { Text } from "@eptss/ui";
interface Props {
  params: Promise<{ projectSlug: string; slug: string }>;
}

export default async function Round({ params }: Props) {
  const resolvedParams = await params;
  const { projectSlug, slug } = resolvedParams;
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  // Handle current round differently if needed
  if(slug === "current") {
    // Get the current round and redirect to its slug
    const currentRoundData = await roundProvider({ projectId });
    return redirect(`/projects/${projectSlug}/round/${currentRoundData.slug || currentRoundData.roundId}`);
  }

  try {
    // Fetch all data at the page level
    const roundData = await roundProvider({ slug, projectId });

    // Fetch user participation for this round
    let hasVoted = false;
    try {
      const participation = await userParticipationProvider({ roundId: roundData.roundId });
      hasVoted = participation?.roundDetails?.hasVoted ?? false;
    } catch (e) {
      // Not signed in or error, treat as not voted
      hasVoted = false;
    }

    // Compute the current phase
    const currentPhase = getCurrentPhase({
      signupOpens: roundData.signupOpens,
      votingOpens: roundData.votingOpens,
      coveringBegins: roundData.coveringBegins,
      coversDue: roundData.coversDue,
      listeningParty: roundData.listeningParty,
    });

    // Only fetch additional data if we're past the signup phase
    if (currentPhase !== "signups") {
      const { voteResults, outstandingVoters, voteBreakdown } = await votesProvider({ projectId, roundSlug: slug });
      const { allRoundSlugs, roundContent } = await roundsProvider({ excludeCurrentRound: false, projectId });

      return (
        <RoundParamsProvider roundSlug={slug}>
          <PageTitle title={`Round ${roundData.roundId} Overview`} />
          <RoundSummary
            projectSlug={projectSlug}
            roundId={roundData.roundId}
            roundData={roundData}
            voteResults={voteResults}
            outstandingVoters={outstandingVoters}
            roundIds={allRoundSlugs}
            voteBreakdown={voteBreakdown}
            allRounds={roundContent}
            hasVoted={hasVoted}
          />
        </RoundParamsProvider>
      );
    }

    // For signup phase, we only need the basic round data
    return (
      <RoundParamsProvider roundSlug={slug}>
        <PageTitle title={`Round ${roundData.roundId} Overview`} />
        <RoundSummary
          projectSlug={projectSlug}
          roundId={roundData.roundId}
          roundData={roundData}
          hasVoted={hasVoted}
        />
      </RoundParamsProvider>
    );
  } catch (error) {
    console.error("Error in round page:", error);
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Round Not Found</h1>
        <Text>Sorry, we couldn&apos;t find the round you&apos;re looking for.</Text>
      </div>
    );
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { projectSlug, slug } = resolvedParams;
  const projectId = getProjectIdFromSlug(projectSlug as ProjectSlug);

  // Handle current round differently if needed
  if(slug === "current") {
    return {
      title: "Current Round | Everyone Plays the Same Song",
      description: "Details about the current round of Everyone Plays the Same Song."
    };
  }

  try {
    const roundData = await roundProvider({ slug, projectId });
    
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
