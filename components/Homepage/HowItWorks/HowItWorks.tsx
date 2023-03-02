import { useNavOptions } from "../../hooks/useNavOptions";
import { SignupButton } from "../SignupButton";
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
  Stack,
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
  phaseInfo: {
    phase: Phase;
    phaseEndsDatelabel: string;
    roundId: number;
  };
}

export const HowItWorks = ({ phaseInfo }: Props) => {
  const { howItWorks } = useNavOptions();
  const blurb = useBlurb(phaseInfo);

  return (
    <Card padding="8" width="80vw" bg="hsla(0,0%,100%,.05)" mx="8">
      <Stack alignItems="center">
        <CardHeader>
          <Heading size="lg">How It Works</Heading>
        </CardHeader>
        <CardBody>
          <Stack alignItems="center">
            <Flex
              flexDirection={{ base: "column", lg: "row" }}
              alignItems="flex-start"
              justifyContent="center"
            >
              {howItWorksContent.map(({ title, description }) => (
                <Box key={title} py={{ base: 2 }} mx={{ base: 0, lg: 4 }}>
                  <Heading as="h3" size="sm" pb="2">
                    {title}
                  </Heading>
                  <Text>{description} </Text>
                </Box>
              ))}
            </Flex>
            <Text color="yellow.300" fontWeight="600" pt="4">
              {blurb}
            </Text>
          </Stack>
        </CardBody>
        <CardFooter>
          <Stack direction={{ base: "column", md: "row" }}>
            <Link id="learn" href={howItWorks} variant="button">
              <Button>Rules</Button>
            </Link>
            <Button>
              <Link href="#listen" variant="button">
                Listen
              </Link>
            </Button>
            <SignupButton />
          </Stack>
        </CardFooter>
      </Stack>
    </Card>
  );
};
