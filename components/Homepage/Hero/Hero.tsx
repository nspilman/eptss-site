import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Center,
  CardFooter,
  Box,
} from "@chakra-ui/react";
import { ActionButtons } from "components/ActionButtons/ActionButtons";

export const Hero = () => {
  return (
    <Center h={{ base: "50vh", lg: "80vh" }} width="100vw">
      <Box m="8">
        <Heading size="sm" fontWeight="500">
          every 2 months
        </Heading>
        <Heading size={{ base: "lg", lg: "2xl" }} mt="2">
          we all choose a song
        </Heading>
        <Heading size={{ base: "lg", lg: "2xl" }} mt="2">
          we all cover it
        </Heading>
        <Heading
          size={{ base: "lg", lg: "2xl" }}
          color="yellow.500"
          mt={{ base: "8", lg: "16" }}
        >
          everyone plays the same song
        </Heading>
      </Box>
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
          <ActionButtons />
        </CardFooter>
      </Card> */}
    </Center>
  );
};
