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
  return (
    <Card width="80vw" my="2" bg="bgTransparent">
      <CardHeader>
        <Link href={`/round/${roundId}`}>
          <Heading as="h3" size="md">
            {headingText}
          </Heading>
        </Link>
      </CardHeader>
      <CardBody>
        {playlist ? (
          <Box dangerouslySetInnerHTML={{ __html: playlist }} />
        ) : (
          <Text>The round is underway!</Text>
        )}
      </CardBody>
    </Card>
  );
};
