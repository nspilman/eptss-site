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
          <Heading
            as="h1"
            size={{ base: "md" }}
            color="white"
            fontWeight="300"
            textAlign="center"
          >
            Everyone Plays the Same Song
          </Heading>
        </CardHeader>
        <CardBody>
          <Flex
            direction={{ base: "column", lg: "row" }}
            alignItems="center"
            justifyContent="center"
          >
            <Link href={howItWorks} pr={{ base: "0", lg: "2" }}>
              <Button mb={{ base: "1", lg: "0" }}>Learn</Button>
            </Link>
            <Link href="/#listen" pr={{ base: "0", lg: "2" }}>
              <Button mb={{ base: "1", lg: "0" }}>Listen</Button>
            </Link>
            <SignupButton />
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
};
