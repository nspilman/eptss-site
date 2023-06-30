import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  HStack,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Phase } from "services/PhaseMgmtService";
import { CTA, RoundActionFunctions } from "./CTA";

interface Props {
  phase: Phase;
  roundId: number;
  isAuthed: boolean;
  hasCompletedPhase: boolean;
  roundActionFunctions: RoundActionFunctions;
  loading?: boolean;
}

export const RoundActionCard = ({
  roundActionFunctions,
  loading,
  isAuthed,
  hasCompletedPhase,
  phase,
  roundId,
}: Props) => {
  const labelContent = (() => {
    const authedLabels: { [key in Phase]: string } = {
      signups: "Next round starts in X days",
      celebration: "Stay tuned for next round details!",
      voting: "Voting ends in X days",
      covering: "Round ends in X days",
    };

    if (isAuthed) {
      return authedLabels[phase];
    } else {
      return phase === "signups" ? (
        <>Next round starts in X days</>
      ) : (
        <>Notify me when next round starts</>
      );
    }
  })();

  return (
    <Card
      bgGradient="linear(to-b, blue.800, gray.800)"
      w={{ base: "80vw", md: "600px" }}
      p={4}
      py={8}
    >
      <CardBody>
        <VStack>
          {loading ? (
            <Center h={"100px"}>
              <Spinner color="white" />
            </Center>
          ) : (
            <>
              <Heading fontSize={{ base: "md", md: "xl" }} textAlign="center">
                {labelContent}
              </Heading>
              <HStack mt={6} gap={"4"}>
                <CTA
                  {...{
                    roundActionFunctions,
                    roundId,
                    hasCompletedPhase,
                    isAuthed,
                    phase,
                  }}
                />
              </HStack>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};
