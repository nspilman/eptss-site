import {
  Card,
  CardBody,
  Center,
  HStack,
  Heading,
  Spinner,
  VStack,
  Text,
} from "@chakra-ui/react";
import { Phase } from "services/PhaseMgmtService";
import { CTA, RoundActionFunctions } from "./CTA";
import { differenceInMilliseconds } from "date-fns";
import { useBlurb } from "../HowItWorks/useBlurb";

interface Props {
  phase: Phase;
  roundId: number;
  isAuthed: boolean;
  hasCompletedPhase: boolean;
  roundActionFunctions: RoundActionFunctions;
  loading?: boolean;
  phaseEndsDate: string;
  phaseEndsDatelabel: string;
}

export const RoundActionCard = ({
  roundActionFunctions,
  loading,
  isAuthed,
  hasCompletedPhase,
  phase,
  roundId,
  phaseEndsDate,
  phaseEndsDatelabel,
}: Props) => {
  const phaseEndsDaysFromToday =
    // calculates the difference in milliseconds and then rounds up
    Math.ceil(
      differenceInMilliseconds(new Date(phaseEndsDate), new Date()) /
        (1000 * 60 * 60 * 24)
    );

  const specificDaysOrSoonLabel =
    phaseEndsDaysFromToday < 0
      ? "soon"
      : `in ${phaseEndsDaysFromToday} day${
          phaseEndsDaysFromToday !== 1 ? "s" : ""
        }`;

  const labelContent = (() => {
    const authedLabels: { [key in Phase]: string } = {
      signups: `Next round starts ${specificDaysOrSoonLabel}`,
      celebration: `Stay tuned for next round details!`,
      voting: `Voting ends ${specificDaysOrSoonLabel}`,
      covering: `Round ends ${specificDaysOrSoonLabel}`,
    };

    if (isAuthed) {
      return authedLabels[phase];
    } else {
      return phase === "signups" ? (
        <>{`Next round starts in ${phaseEndsDaysFromToday} days`}</>
      ) : (
        <>Notify me when next round starts</>
      );
    }
  })();

  const blurb = useBlurb({ phase, roundId, phaseEndsDatelabel });

  return (
    <Card
      bgGradient="linear(to-b, gray.700, blue.900)"
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
              <VStack pt={"6"} gap={"4"}>
                <CTA
                  {...{
                    roundActionFunctions,
                    roundId,
                    hasCompletedPhase,
                    isAuthed,
                    phase,
                  }}
                />
                <Text
                  color="yellow.300"
                  fontWeight="300"
                  pt="4"
                  textAlign="center"
                >
                  {blurb}
                </Text>
              </VStack>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};
