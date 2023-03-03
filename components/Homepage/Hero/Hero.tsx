import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Center,
  CardFooter,
} from "@chakra-ui/react";
import { ActionButtons } from "components/ActionButtons/ActionButtons";

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
      </Card>
    </Center>
  );
};
