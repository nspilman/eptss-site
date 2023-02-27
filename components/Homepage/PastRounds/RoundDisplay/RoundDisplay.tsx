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
}: {
  round: RoundDetails;
}): ReactElement => {
  const { playlist, title, artist, round: roundId } = round;
  return (
    <Card width="80vw" my="2" bg="hsla(0,0%,100%,.05)" color="white">
      <CardHeader>
        <Link href={`/round/${roundId}`}>
          <Heading as="h3" size="md">
            Round {roundId} - {title} by {artist}
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
