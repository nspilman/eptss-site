import { ReactElement } from "react";
import { RoundDetails } from "@eptss/core/types/roundDetails";
import Link from "next/link";

import { Text } from "@eptss/ui";
export const RoundDisplay = ({
  round,
  currentRound,
  isVotingPhase,
}: {
  round: RoundDetails;
  currentRound: number;
  isVotingPhase: boolean;
}): ReactElement => {
  const { playlistUrl, title, artist, roundId, slug } = round;
  const showVotingUnderwayText =
    round.roundId === currentRound && isVotingPhase;

  const headingText = `${roundId}. ${
    showVotingUnderwayText ? "Voting Underway" : `${title} by ${artist}`
  }`;

  function getPlaylistUrl(inputText: string) {
    let regex =
      /href="(https:\/\/soundcloud\.com\/nate-spilman\/sets\/[^"]*)"/g;
    let match = regex.exec(inputText);
    return match ? match[1] : "No URL found";
  }

  return (
    <div className="relative">
      <div className="w-[80vw] rounded-lg z-10 relative p-2 my-2 bg-bgGradientDarkerBLue bg-opacity-10 flex justify-between">
        <span className="text-md md:text-lg text-white font-fraunces font-semibold">
          <Link href={`/round/${slug || roundId}`}>{headingText}</Link>
        </span>
        {playlistUrl && (
          <Link
            href={getPlaylistUrl(playlistUrl)}
            target="_blank"
            rel="noreferrer"
          >
            <Text as="span" weight="bold" className="text-md font-roboto text-accentPrimary hover:text-white py-1 cursor-pointer">
              Listen
            </Text>
          </Link>
        )}
        {!playlistUrl && (
          <Text as="span" className="text-md font-light font-roboto text-white">
            The round is underway!
          </Text>
        )}
      </div>
    </div>
  );
};
