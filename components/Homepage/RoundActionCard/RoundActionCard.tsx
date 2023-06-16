import { Box, Button, Card, CardBody, Heading, VStack } from "@chakra-ui/react";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { Phase } from "services/PhaseMgmtService";

interface Props {
  phase: Phase;
  roundId: number;
}

export const RoundActionCard = ({ phase, roundId }: Props) => {
  const { session } = useSessionContext();
  const isAuthed = !!session?.user;

  // TODO: get user's current round activity
  // if they've already joined, voted, or submitted

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
    if (isAuthed) {
      switch (phase) {
        case "signups":
          return <Button>I&apos;m in!</Button>;
        case "celebration":
          return <Button>Profile</Button>;
        case "voting":
          return (
            <>
              <Button>Round X</Button>
              <Button>Vote Now!</Button>
            </>
          );
        case "covering":
          return (
            <>
              <Button>Round X</Button>
              <Button>Submit My Cover!</Button>
            </>
          );
      }
    } else {
      if (phase === "signups") {
        return <Button>I&apos;m in!</Button>;
      } else {
        return <Button>Sign Up</Button>;
      }
    }
  };
  return (
    <Card bgGradient="linear(to-b, gray.700, blue.900)" p={4}>
      <CardBody>
        <VStack px={{ base: 6, lg: 12 }} py={4}>
          <Heading fontSize={{ base: "md", md: "xl" }}>
            {renderLabelContent()}
          </Heading>
          <Box mt={6}>{renderCTAContent()}</Box>
        </VStack>
      </CardBody>
    </Card>
  );
};
