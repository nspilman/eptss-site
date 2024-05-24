"use client";
import { ReactElement } from "react";
import { RoundDetails } from "types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const RoundDisplay = ({
  round,
  currentRound,
  isVotingPhase,
}: {
  round: RoundDetails;
  currentRound: number;
  isVotingPhase: boolean;
}): ReactElement => {
  const { playlistUrl, title, artist, roundId } = round;
  const showVotingUnderwayText =
    round.roundId === currentRound && isVotingPhase;

  const headingText = ` ${
    showVotingUnderwayText ? "Voting Underway" : `${title} by ${artist}`
  }`;

  function getPlaylistUrl(inputText: string) {
    let regex =
      /href="(https:\/\/soundcloud\.com\/nate-spilman\/sets\/[^"]*)"/g;
    let match = regex.exec(inputText);
    return match ? match[1] : "No URL found";
  }
  return (
    <Card className="w-3/4">
      <CardHeader>
        <CardTitle>Round {roundId}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="pt-4 pb-10">
          <div className="pb-4 sm:pb-6">
            <p className="font-semibold text-lg text-center sm:text-2xl sm:text-left">
              Covered: {headingText}
            </p>
          </div>
          <div className="flex justify-center">
            <Button className="w-1/2">
              <Link
                href={getPlaylistUrl(playlistUrl)}
                target="_blank"
                rel="noreferrer"
              >
                Listen
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center sm:justify-end">
          <Button variant={"outline"}>
            <Link href={`/round/${roundId}`}> Round Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
