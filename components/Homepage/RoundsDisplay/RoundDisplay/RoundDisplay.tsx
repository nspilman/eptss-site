import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Link,
  Text,
} from "@chakra-ui/react";
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

  const headingText = `Round ${roundId} - ${
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
        <Heading as="h3" size="md">
          <Link href={`/round/${roundId}`}>{headingText}</Link>
        </Heading>
        {playlist && (
          <Link
            href={getPlaylistUrl(playlist)}
            target="_blank"
            rel="noreferrer"
          >
            <Text color="yellow">Listen</Text>
          </Link>
        )}
        {!playlist && <Text>The round is underway!</Text>}
      </div>
    </div>
  );
};
