import { useNavOptions } from "../../hooks/useNavOptions";
import { SignupButton } from "../SignupButton";
import {
  Button,
  Link,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Flex,
  Center,
} from "@chakra-ui/react";

export const Hero = () => {
  const { howItWorks } = useNavOptions();
  const buttonStyles = {
    mb: {
      base: 1,
      lg: 0,
    },
    pr: {
      base: 0,
      lg: 2,
    },
  };
  return (
    <Center h="100vh" width="100vw">
      <Card background="none">
        <CardHeader>
          <Center>
            <Heading size="md">Everyone Plays the Same Song</Heading>
          </Center>
        </CardHeader>
        <CardBody>
          <Flex
            direction={{ base: "column", lg: "row" }}
            alignItems="center"
            justifyContent="center"
          >
            <Link href={howItWorks} {...buttonStyles}>
              <Button>Learn</Button>
            </Link>
            <Link href="/#listen" {...buttonStyles}>
              <Button>Listen</Button>
            </Link>
            <SignupButton />
          </Flex>
        </CardBody>
      </Card>
    </Center>
  );
};
