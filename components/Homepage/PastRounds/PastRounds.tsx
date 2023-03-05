import { Stack, Box, Heading } from "@chakra-ui/react";
import { RoundDetails } from "types";
import { RoundDisplay } from "./RoundDisplay";

interface Props {
  pastRounds: RoundDetails[];
}
export const PastRounds = ({ pastRounds }: Props) => {
  console.log({ pastRounds });
  return (
    <Stack direction="column" py="8">
      <Box>
        <Heading as="h1" id="listen" pb="8" size={{ base: "md", lg: "lg" }}>
          Past Rounds
        </Heading>
      </Box>
      {pastRounds
        .filter((round) => round.title)
        .map((round) => {
          return <RoundDisplay key={round.round} round={round} />;
        })}
    </Stack>
  );
};
