"use client";

import { Button, Card } from "@/components/ui/primitives";
import Link from "next/link";
import { Navigation } from "@/enum/navigation";
import { Phase, RoundInfo } from "@/types/round";
import { SignupData } from "@/types/signup";
import { UserRoundParticipation } from "@/types/user";
import { useState } from "react";
import { formatDate } from '@/services/dateService';
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { signupForRound, signupForRoundWithResult } from "../../actions";
import { UserVotesDisplay } from "@/components/UserVotesDisplay";
import { TimeRemainingDisplay } from "../TimeRemainingDisplay";

interface CurrentRoundDisplayProps {
  roundInfo: RoundInfo | null;
  userRoundDetails?: UserRoundParticipation;
  userId?: string;
  userVotesWithDetails?: {
    title: string;
    artist: string;
    rating: number;
  }[] | null;
}

// Helper functions for phase management
const getPhaseTitle = (phase: Phase) => {
  switch (phase) {
    case "signups":
      return "Song Selection & Signups";
    case "covering":
      return "Covering";
    case "voting":
      return "Voting";
    case "celebration":
      return "Round Celebration";
    default:
      return "Current Phase";
  }
};

const getNextPhase = (currentPhase: Phase): Phase => {
  const phaseTransitions: Record<Phase, Phase> = {
    signups: "covering",
    covering: "voting",
    voting: "celebration",
    celebration: "signups",
  };

  return phaseTransitions[currentPhase];
};

const getPhaseCompletionStatus = (
  phase: Phase,
  isParticipating: boolean,
  userRoundDetails: UserRoundParticipation
): boolean => {
  if (!isParticipating) return false;

  const completionMap: Record<Phase, boolean> = {
    signups: userRoundDetails.hasSignedUp,
    covering: userRoundDetails.hasSubmitted,
    voting: userRoundDetails.hasVoted,
    celebration: true,
  };

  return completionMap[phase];
};

const getActionButton = (
  phase: Phase,
  hasCompleted: boolean,
  roundId: number
): { text: string; href: string } | null => {
  switch (phase) {
    case "signups":
      return {
        text: hasCompleted ? "Update Song Suggestion" : "Suggest a Song",
        href: hasCompleted ? `${Navigation.SignUp}?update=true` : Navigation.SignUp,
      };
    case "covering":
      return {
        text: hasCompleted ? "Update Submission" : "Submit Cover",
        href: Navigation.Submit,
      };
    case "voting":
      return {
        text: hasCompleted ? "Update Votes" : "Cast Votes",
        href: `${Navigation.Voting}?update=true`,
      };
    case "celebration":
      return {
        text: "View Round Results",
        href: `/round/${roundId}`,
      };
    default:
      return null;
  }
};

export function CurrentRoundDisplay({ roundInfo, userRoundDetails, userId, userVotesWithDetails }: CurrentRoundDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // If we don&apos;t have round info, we can&apos;t show anything meaningful
  if (!roundInfo) {
    return (
      <Card className="w-full p-8 bg-gray-900/50 border-gray-800 relative overflow-hidden backdrop-blur-xs mb-8">
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold mb-4 text-primary">No Active Round</h2>
          <p className="text-secondary mb-6">There doesn&apos;t appear to be an active round at the moment.</p>
        </div>
      </Card>
    );
  }
  
  // If we have round info but no user round details, the user hasn&apos;t participated yet
  if (!userRoundDetails) {
    const { roundId, phase, song, dateLabels } = roundInfo;
    const currentPhaseEndDate = dateLabels[phase]?.closes;
    
    return (
      <div>
        <Card className="w-full p-8 bg-gray-900/50 border-gray-800 relative overflow-hidden backdrop-blur-xs mb-8">
          <div>
            <h2 className="text-2xl font-semibold mb-8 text-primary">Current Round Progress</h2>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-[var(--color-accent-primary)] mb-2 text-lg">Phase</p>
                  <p className="text-xl text-primary font-medium">{getPhaseTitle(phase)}</p>
                </div>
                {phase === "signups" && (
                  <div>
                    <p className="text-[var(--color-accent-primary)] mb-2 text-lg">Current Signups</p>
                    <p className="text-xl text-primary font-medium">{roundInfo.signups?.length || 0}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[var(--color-accent-primary)] mb-2 text-lg">Deadline</p>
                  <p className="text-xl text-primary font-medium">
                    {currentPhaseEndDate ? formatDate.v(currentPhaseEndDate) : "TBD"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-background-tertiary border border-accent-tertiary">
              <h3 className="text-lg font-medium text-primary mb-2">Welcome to EPTSS!</h3>
              <p className="text-secondary">
                You haven&apos;t signed up for the current round yet. Join in to participate in our community of musicians!
              </p>
            </div>
            
            {phase === "signups" && (
              <div className="mt-12 flex flex-col items-center p-10 bg-gray-900/70 rounded-lg border border-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
                <div className="relative z-10 flex flex-col items-center w-full max-w-md">
                  <Button
                    size="lg"
                    variant="default"
                    className="w-full sm:w-auto bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900 border-none shadow-lg shadow-[var(--color-accent-primary)] hover:shadow-[var(--color-accent-primary)] transition-all"
                    asChild
                  >
                    <Link href={Navigation.SignUp}>
                      Sign Up for Round {roundId}
                    </Link>
                  </Button>
                </div>
              </div>
            )}
            
            {phase === "covering" && (
              <div className="mt-12 flex flex-col items-center p-10 bg-gray-900/70 rounded-lg border border-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
                <div className="relative z-10 flex flex-col items-center w-full max-w-md">
                  <p className="text-secondary mb-4 text-center">
                    The covering phase is now open! You can still sign up to participate in this round.
                  </p>
                  <form action={async (formData: FormData) => {
                    await signupForRound(formData);
                  }}>
                    <input type="hidden" name="roundId" value={roundInfo.roundId} />
                    <input type="hidden" name="userId" value={userId || ''} />
                    <Button
                      size="lg"
                      variant="default"
                      className="w-full sm:w-auto bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900 border-none shadow-lg shadow-[var(--color-accent-primary)] hover:shadow-[var(--color-accent-primary)] transition-all"
                      type="submit"
                      disabled={isLoading || !userId}
                    >
                      {isLoading ? "Signing up..." : `Sign Up for Round ${roundId}`}
                    </Button>
                  </form>
                </div>
              </div>
            )}
            
            {phase !== "signups" && phase !== "covering" && (
              <div className="mt-12 flex flex-col items-center p-10 bg-gray-900/70 rounded-lg border border-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
                <div className="relative z-10 flex flex-col items-center w-full max-w-md">
                  <p className="text-secondary mb-4 text-center">
                    The signup phase has ended for this round. You can join in the next round when signups open!
                  </p>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    asChild
                  >
                    <Link href={`/round/${roundInfo.slug}`}>
                      View Current Round
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const {
    roundId,
    phase,
    song,
    dateLabels,
  } = roundInfo;

  const isParticipating = userRoundDetails.hasSignedUp;
  const hasCompletedCurrentPhase = getPhaseCompletionStatus(phase, isParticipating, userRoundDetails);

  const currentPhaseEndDate = dateLabels[phase]?.closes;
  
  // Find the user&apos;s signup song if they&apos;ve signed up
  const userSignup = isParticipating && phase === "signups" && roundInfo.signups ? 
    roundInfo.signups.find((signup: SignupData) => 
      signup.userId === userRoundDetails.user.userid
    ) : null;

  return (
    <div>
      {/* Time Remaining Display */}
      {currentPhaseEndDate && (
        <TimeRemainingDisplay phaseCloses={currentPhaseEndDate} currentPhase={phase} />
      )}

      {/* Current Round Status */}
      <Card className="w-full p-8 bg-gray-900/50 border-gray-800 relative overflow-hidden backdrop-blur-xs mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-8 text-primary">Current Round Progress</h2>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-[var(--color-accent-primary)] mb-2 text-lg">Phase</p>
                <p className="text-xl text-primary font-medium">{getPhaseTitle(phase)}</p>
              </div>
              {phase === "signups" && (
                <div>
                  <p className="text-[var(--color-accent-primary)] mb-2 text-lg">Current Signups</p>
                  <p className="text-xl text-primary font-medium">{roundInfo.signups?.length || 0}</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[var(--color-accent-primary)] mb-2 text-lg">Deadline</p>
                <p className="text-xl text-primary font-medium">
                  {currentPhaseEndDate ? formatDate.v(currentPhaseEndDate) : "TBD"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Show user&apos;s signup song if they&apos;ve signed up during signup phase */}
          {phase === "signups" && isParticipating && (
            <div className="mt-6 p-4 rounded-lg bg-background-secondary border border-accent-secondary">
              <h3 className="text-lg font-medium text-primary mb-2">Your Song Suggestion</h3>
              {userSignup ? (
                <p className="text-accent-primary">
                  {userSignup.song?.title || 'Unknown'} by {userSignup.song?.artist || 'Unknown'}
                </p>
              ) : (
                <p className="text-secondary">
                  You&apos;ve signed up, but we couldn&apos;t find your song details. You may want to update your submission.
                </p>
              )}
            </div>
          )}
          
          {/* Show user votes if in voting phase and has voted */}
          {phase === "voting" && isParticipating && hasCompletedCurrentPhase && userVotesWithDetails && userVotesWithDetails.length > 0 && (
            <div className="mt-6">
              <UserVotesDisplay votedSongs={userVotesWithDetails} />
            </div>
          )}

          {/* Explanation about voting responsibility */}
          {phase === "signups" && (
            <div className="mt-6 p-4 rounded-lg bg-background-tertiary border border-accent-tertiary">
              <h3 className="text-lg font-medium text-primary mb-2">What&apos;s Next?</h3>
              <p className="text-secondary">
                Once the signup phase ends, you&apos;ll be responsible for voting on the cover options. 
                Your vote helps determine which song will be selected for the round!
              </p>
            </div>
          )}

            <div className="mt-12 flex flex-col items-center p-10 bg-gray-900/70 rounded-lg border border-gray-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
              <div className="relative z-10 flex flex-col items-center w-full max-w-md">
                {isParticipating && (() => {
                  const actionButton = getActionButton(phase, hasCompletedCurrentPhase, roundId);
                  return actionButton && (
                    <Button
                      size="lg"
                      variant="default"
                      className="w-full sm:w-auto px-8 py-6 text-lg font-bold bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900 border-none shadow-lg shadow-[var(--color-accent-primary)] hover:shadow-[var(--color-accent-primary)] transition-all"
                      asChild
                    >
                      <Link href={actionButton.href}>
                        {actionButton.text}
                      </Link>
                    </Button>
                  );
                })()
                }

                {(!isParticipating && (phase === "signups" || phase === "covering")) && (
                  <>
                    <div className="mb-6 text-center">
                      <h3 className="text-lg font-medium text-primary mb-2">You&apos;re not participating in this round yet</h3>
                      <p className="text-secondary max-w-md mx-auto">
                        {phase === "signups" 
                          ? "Join the current round by signing up below. You&apos;ll be able to suggest a song for everyone to cover." 
                          : "The covering phase has already started, but you can still join! Sign up below to participate without suggesting a song."}
                      </p>
                    </div>
                    {phase === "signups" ? (
                      <Button
                        size="lg"
                        variant="default"
                        className="w-full sm:w-auto bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900 border-none shadow-lg shadow-[var(--color-accent-primary)] hover:shadow-[var(--color-accent-primary)] transition-all"
                        asChild
                      >
                        <Link href={Navigation.SignUp}>
                          Sign Up for Round {roundId}
                        </Link>
                      </Button>
                    ) : (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        setIsLoading(true);
                        
                        try {
                          const formData = new FormData(e.currentTarget);
                          const result = await signupForRoundWithResult(formData);
                          
                          if (result.status === "Success") {
                            toast({
                              title: "Success!",
                              description: result.message,
                              variant: "default",
                            });
                            router.refresh();
                          } else {
                            toast({
                              title: "Error",
                              description: result.message,
                              variant: "destructive",
                            });
                          }
                        } catch (error) {
                          console.error('Error signing up:', error);
                          toast({
                            title: "Error",
                            description: "There was an error signing up. Please try again.",
                            variant: "destructive",
                          });
                        } finally {
                          setIsLoading(false);
                        }
                      }}>
                        <input type="hidden" name="roundId" value={roundInfo.roundId} />
                        <input type="hidden" name="userId" value={userId || ''} />
                        <Button
                          size="lg"
                          variant="default"
                          className="w-full sm:w-auto bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900 border-none shadow-lg shadow-[var(--color-accent-primary)] hover:shadow-[var(--color-accent-primary)] transition-all"
                          type="submit"
                          disabled={isLoading || !userId}
                        >
                          {isLoading ? (
                            <>
                              <span className="mr-2">Signing up...</span>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
                            </>
                          ) : (
                            `Sign Up for Round ${roundId}`
                          )}
                        </Button>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
    </div>
  );
}
