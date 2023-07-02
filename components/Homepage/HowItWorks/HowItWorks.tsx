import { Phase } from "services/PhaseMgmtService";
import { useBlurb } from "./useBlurb";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Text,
  Heading,
  Flex,
  Stack,
  List,
  ListItem,
} from "@chakra-ui/react";
import { ButtonsContainer } from "components/ButtonsContainer";
import { FAQButton, RoundsButton } from "components/NavButtons";

interface Props {
  phaseInfo: {
    phase: Phase;
    phaseEndsDatelabel: string;
    roundId: number;
  };
}

export const HowItWorks = ({ phaseInfo }: Props) => {
  const blurb = useBlurb(phaseInfo);

  return (
    <Card
      padding={{ base: 0, md: 2 }}
      width="80vw"
      bg="bgTransparent"
      mx="8"
      id="how-it-works"
    >
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
              <Box
                mx={{ base: 0, lg: 4 }}
                textAlign="center"
                fontWeight="light"
              >
                <List color="white" fontWeight="bold" pb="8">
                  <ListItem>Sign up with the song you want to cover</ListItem>
                  <ListItem>Vote on your favorite cover options</ListItem>
                  <ListItem>Cover the song that wins</ListItem>
                  <ListItem>Celebrate with your peers</ListItem>
                </List>
                <Text py="1">
                  {`Everyone Plays the Same Song is a community project open to musicians of all skill levels, inviting participants to cover the same song each round.`}
                </Text>
                <Text py="1">
                  {`Sign up by creating an account and submit the song you'd like to cover for the upcoming round. Songs are chosen based on participant voting, using a scale from 1 (not interested in covering) to 5 (very interested in covering). Once the song is selected, you will have just over a month to submit your SoundCloud cover link.  The fun doesn't stop there - after submission, we compile all covers into a playlist for a communal listening party. `}
                </Text>
                <Text py="1">{`No special equipment or software is required - just your passion for music. You choose which rounds to participate in, allowing you to be part of the song selection and music-making process as per your interest and convenience. Join us for a celebration of music and community! We can't wait to hear your interpretation of... the same song!`}</Text>
              </Box>
            </Flex>
            <Text color="yellow.300" fontWeight="600" pt="4">
              {blurb}
            </Text>
          </Stack>
        </CardBody>
        <CardFooter>
          <ButtonsContainer>
            <FAQButton />
            <RoundsButton />
          </ButtonsContainer>
        </CardFooter>
      </Stack>
    </Card>
  );
};
