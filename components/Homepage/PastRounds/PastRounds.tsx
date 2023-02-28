import { Stack, Box, Heading } from "@chakra-ui/react";
import { RoundDetails } from "types";
import { RoundDisplay } from "./RoundDisplay";

interface Props {
  pastRounds: RoundDetails[];
}
export const PastRounds = ({ pastRounds }: Props) => {
  return (
    <Stack direction="column" py="8">
      <Box>
        <Heading id="listen">The Playlists!</Heading>
      </Box>
      {pastRounds
        .filter((round) => round.title)
        .map((round) => {
          return <RoundDisplay key={round.round} round={round} />;
        })}
    </Stack>
  );
};
