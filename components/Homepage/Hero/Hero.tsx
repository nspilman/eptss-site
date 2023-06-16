import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Center,
  CardFooter,
  Box,
  VStack,
  Text,
} from "@chakra-ui/react";
import { ButtonsContainer } from "components/ButtonsContainer";
import {
  HowItWorksButton,
  JoinRoundButton,
  RoundsButton,
  SignupButton,
} from "components/NavButtons";
import Image from "next/image";

export const Hero = () => {
  return (
    <Center
      h={{ base: "70vh", md: "100vh" }}
      w="100%"
      background="linear-gradient(var(--chakra-colors-gradient-darkBlueHero), var(--chakra-colors-gradient-graybluehero)), url('https://images.unsplash.com/photo-1458560871784-56d23406c091?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80') fixed"
      backgroundSize="cover"
      backgroundRepeat="no-repeat"
      backgroundPosition="center"
    >
      <VStack alignItems="flex-start" px={{ base: "8", md: "16", lg: "24" }}>
        <Text fontFamily="Fraunces" fontSize={"14"}>
          every 2 months
        </Text>
        <Heading as="h1" fontSize={{ base: "lg", md: "2xl", lg: "4xl" }}>
          we all choose a song
        </Heading>
        <Heading as="h1" fontSize={{ base: "lg", md: "2xl", lg: "4xl" }}>
          we all cover it
        </Heading>
        <Box>
          <Heading
            as="h1"
            mt={"16"}
            fontSize={{ base: "lg", md: "2xl", lg: "4xl" }}
          >
            everyone plays the same song
          </Heading>
          <Image
            src="/pencil-underline.png"
            layout="responsive"
            height={"10px"}
            width={"100%"}
          />
        </Box>
      </VStack>

      {/* <Card
        background="none"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CardHeader>
          <Center>
            <Heading size="md" textAlign="center">
              Everyone Plays the Same Song
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
      </Card> */}
    </Center>
  );
};
