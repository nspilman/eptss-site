import { Link } from "@chakra-ui/react";
import { ReactElement } from "react";
import { RoundDetails } from "types";

export const RoundDisplay = ({
  round,
  currentRound,
  isVotingPhase,
}: {
  round: RoundDetails;
  currentRound: number;
  isVotingPhase: boolean;
}): ReactElement => {
  const { playlist, title, artist, roundId } = round;
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
          <Link href={`/round/${roundId}`}>{headingText}</Link>
        </span>
        {playlist && (
          <Link
            href={getPlaylistUrl(playlist)}
            target="_blank"
            rel="noreferrer"
          >
            <span className="text-md font-bold font-roboto text-themeYellow hover:text-white py-1">
              Listen
            </span>
          </Link>
        )}
        {!playlist && (
          <span className="text-md font-light font-roboto text-white">
            The round is underway!
          </span>
        )}
      </div>
    </div>
  );
};
