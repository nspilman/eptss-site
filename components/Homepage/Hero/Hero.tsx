import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Center,
  CardFooter,
  Box,
} from "@chakra-ui/react";
import { ButtonsContainer } from "components/ButtonsContainer";
import {
  HowItWorksButton,
  JoinRoundButton,
  RoundsButton,
  SignupButton,
} from "components/NavButtons";

export const Hero = () => {
  return (
    <Center h="100vh" width="100vw">
      <Card
        background="none"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CardHeader>
          <Center>
            <Heading size="md" textAlign="center">
              everyone Plays the Same Song
            </Heading>
          </Center>
        </CardHeader>
        <CardFooter
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <ButtonsContainer>
            <HowItWorksButton />
            <RoundsButton />
            <JoinRoundButton />
            <Box display={{ base: "block", md: "none" }}>
              <SignupButton />
            </Box>
          </ButtonsContainer>
        </CardFooter>
      </Card>
    </Center>
  );
};
