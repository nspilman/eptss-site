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
} from "@chakra-ui/react";

export const Hero = () => {
  const { howItWorks } = useNavOptions();
  return (
    <Flex h="100vh" width="100vw" alignItems="center" justifyContent="center">
      <Card background="none">
        <CardHeader>
          <Heading as="h1" size={{ base: "md" }}>
            Everyone Plays the Same Song
          </Heading>
        </CardHeader>
        <CardBody>
          <Flex direction={{ base: "column" }} alignItems="center">
            <Link href={howItWorks}>
              <Button mb="1">Learn</Button>
            </Link>
            <Link href="/#listen">
              <Button mb="1">Listen</Button>
            </Link>
            <SignupButton />
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
};
