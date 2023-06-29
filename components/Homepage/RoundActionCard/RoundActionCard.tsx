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

interface Props {
  phase: Phase;
  roundId: number;
  isAuthed?: boolean;
  hasSignedUp?: boolean;
  hasVoted?: boolean;
  hasSubmitted?: boolean;
  onProfile: () => void;
  onSignup: () => void;
  onSignupAndJoinRound: () => void;
  onJoinRound: () => void;
  onVote: () => void;
  onSubmit: () => void;
  onRoundDetails: () => void;
  loading?: boolean;
}

export const RoundActionCard = ({
  phase,
  roundId,
  isAuthed,
  hasSignedUp,
  hasSubmitted,
  hasVoted,
  onProfile,
  onSignup,
  onSignupAndJoinRound,
  onJoinRound,
  onVote,
  onSubmit,
  onRoundDetails,
  loading,
}: Props) => {
  const renderLabelContent = () => {
    if (isAuthed) {
      switch (phase) {
        case "signups":
          return <>Next round starts in X days</>;
        case "celebration":
          return <>Stay tuned for next round details!</>;
        case "voting":
          return <>Voting ends in X days</>;
        case "covering":
          return <>Round ends in X days</>;
      }
    } else {
      if (phase === "signups") {
        return <>Next round starts in X days</>;
      } else {
        return <>Notify me when next round starts</>;
      }
    }
  };

  const renderCTAContent = () => {
    if (!isAuthed) {
      if (phase === "signups") {
        return <Button onClick={onSignupAndJoinRound}>I&apos;m in!</Button>;
      } else {
        return <Button onClick={onSignup}>Sign Up</Button>;
      }
    }
    switch (phase) {
      case "signups":
        if (hasSignedUp) {
          return (
            <>
              <Button onClick={onRoundDetails}>{`Round ${roundId}`}</Button>
              <Text>You&apos;re in!</Text>
            </>
          );
        } else {
          return <Button onClick={onJoinRound}>I&apos;m in!</Button>;
        }

      case "celebration":
        return <Button onClick={onProfile}>Profile</Button>;
      case "voting":
        if (hasVoted) {
          return (
            <>
              <Button onClick={onRoundDetails}>{`Round ${roundId}`}</Button>
              <Text>You voted!</Text>
            </>
          );
        } else {
          return (
            <>
              <Button onClick={onRoundDetails}>{`Round ${roundId}`}</Button>
              <Button onClick={onVote}>Vote Now</Button>
            </>
          );
        }

      case "covering":
        if (hasSubmitted) {
          return (
            <>
              <Button onClick={onRoundDetails}>{`Round ${roundId}`}</Button>
              <Text>You submitted!</Text>
            </>
          );
        } else {
          return (
            <>
              <Button onClick={onRoundDetails}>{`Round ${roundId}`}</Button>
              <Button onClick={onSubmit}>Submit My Cover</Button>
            </>
          );
        }
    }
  };
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
                {renderLabelContent()}
              </Heading>
              <HStack mt={6} gap={"4"}>
                {renderCTAContent()}
              </HStack>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};
