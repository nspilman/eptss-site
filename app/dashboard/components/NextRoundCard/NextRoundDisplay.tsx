"use client";

import { Button, Card } from "@/components/ui/primitives";
import Link from "next/link";
import { formatDate } from '@/services/dateService';
import { NextRoundData } from '@/data-access/roundService';

interface NextRoundDisplayProps {
  nextRound: NextRoundData;
  nextRoundUserSignup?: {
    songTitle?: string;
    artist?: string;
    youtubeLink?: string;
    additionalComments?: string;
  } | null;
}

export function NextRoundDisplay({ nextRound, nextRoundUserSignup }: NextRoundDisplayProps) {
  return (
    <Card className="w-full p-8 bg-gray-900/50 border-gray-800 relative overflow-hidden backdrop-blur-xs">
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-primary">Next Round</h2>
        <div className="space-y-6">
          <div>
            <p className="text-[var(--color-accent-primary)] mb-2 text-lg">Round {nextRound.roundId}</p>
            {nextRound.song?.title ? (
              <p className="text-xl text-primary font-medium">
                {nextRound.song.title} by {nextRound.song.artist}
              </p>
            ) : (
              <p className="text-xl text-secondary">
                Song to be determined by voting
              </p>
            )}
          </div>

          {(nextRound.signupOpens || nextRound.coveringBegins) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {nextRound.signupOpens && (
                <div>
                  <p className="text-[var(--color-accent-primary)] mb-2 text-lg">Signup Opens</p>
                  <p className="text-xl text-primary font-medium">
                    {formatDate.v(nextRound.signupOpens)}
                  </p>
                </div>
              )}
              {nextRound.coveringBegins && (
                <div>
                  <p className="text-[var(--color-accent-primary)] mb-2 text-lg">Voting Closes</p>
                  <p className="text-xl text-primary font-medium">
                    {formatDate.v(nextRound.coveringBegins)}
                  </p>
                </div>
              )}
            </div>
          )}

          {nextRoundUserSignup ? (
            <div className="p-4 rounded-lg bg-background-secondary border border-accent-secondary">
              <h3 className="text-lg font-medium text-primary mb-2">Your Song Suggestion</h3>
              <p className="text-accent-primary">
                {nextRoundUserSignup.songTitle} by {nextRoundUserSignup.artist}
              </p>
              <div className="mt-4">
                <Button
                  size="md"
                  variant="outline"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <Link href={`/sign-up/${nextRound.slug || nextRound.roundId}?update=true`}>
                    Update Song Suggestion
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-background-tertiary border border-accent-tertiary">
              <h3 className="text-lg font-medium text-primary mb-2">Ready to participate?</h3>
              <p className="text-secondary mb-4">
                Sign up early for the next round and suggest a song for everyone to cover!
              </p>
              <Button
                size="md"
                variant="default"
                className="w-full sm:w-auto bg-[var(--color-accent-secondary)] hover:bg-[var(--color-accent-secondary)] hover:opacity-90 text-gray-900"
                asChild
              >
                <Link href={`/sign-up/${nextRound.slug || nextRound.roundId}`}>
                  Sign Up for Round {nextRound.roundId}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
