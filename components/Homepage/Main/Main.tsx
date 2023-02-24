import { useNavOptions } from "../../hooks/useNavOptions";
import { RoundDetails } from "../../../types";
import { SignupButton } from "../SignupButton";
import { RoundDisplay } from "./RoundDisplay";
import { Phase } from "services/PhaseMgmtService";
import { useBlurb } from "./useBlurb";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Link,
  Button,
  CardFooter,
  Text,
  Heading,
  Flex,
} from "@chakra-ui/react";

const howItWorksContent = [
  {
    title: "1. Sign Up",
    description: "Sign up and submit a song that you would like to cover.",
  },
  {
    title: "2. Select",
    description:
      "Vote for the song that all participants will cover as a community.",
  },
  {
    title: "3. Submit",
    description:
      "Submit your cover and celebrate with a virtual listening party.",
  },
];

interface Props {
  roundContent: RoundDetails[];
  phaseInfo: {
    phase: Phase;
    phaseEndsDatelabel: string;
    roundId: number;
  };
}

export const Main = ({ roundContent, phaseInfo }: Props) => {
  const { howItWorks } = useNavOptions();
  const blurb = useBlurb(phaseInfo);

  return (
    <Flex direction="column">
      <Card padding="8" width="80vw">
        <CardHeader>
          <Heading size="lg">How It Works</Heading>
        </CardHeader>
        <CardBody>
          <Box display="flex" flexDirection={{ base: "column" }}>
            {howItWorksContent.map(({ title, description }) => (
              <Box key={title} py={{ base: "2" }}>
                <Heading as="h3" size={{ base: "sm" }}>
                  {title}
                </Heading>
                <Text>{description} </Text>
              </Box>
            ))}
          </Box>
          <Text>{blurb}</Text>
        </CardBody>
        <CardFooter>
          <Flex direction="column">
            <Link id="learn">
              <Button>Rules</Button>
            </Link>
            <Button>
              <Link href="#listen">Listen</Link>
            </Button>
            <SignupButton />
          </Flex>
        </CardFooter>
      </Card>

      <Box>
        <Heading id="listen">The Playlists!</Heading>
      </Box>
      {roundContent
        .filter((round) => round.title)
        .map((round) => {
          return <RoundDisplay key={round.round} round={round} />;
        })}
    </Flex>
  );
};
