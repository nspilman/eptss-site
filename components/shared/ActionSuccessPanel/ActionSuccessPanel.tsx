import { Button, Heading, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";

interface Props {
  text: {
    header: string;
    body: string;
    thankyou: string;
  };
  image: {
    src: string;
    alt: string;
  };
}

export const ActionSuccessPanel = ({
  text: { header, body, thankyou },
  image: { src, alt },
}: Props) => {
  return (
    <Stack alignItems="center">
      <Heading as="h1" size="md" textAlign="center" fontWeight="300">
        {header}
      </Heading>
      <Text textAlign="center" fontWeight="200" my="4">
        {body}
      </Text>
      <Image src={src} alt={alt} width={500} height={500} />
      <Text fontWeight="200" my="4">
        {thankyou}
      </Text>
      <Link href="/#listen">
        <Button>Home</Button>
      </Link>
    </Stack>
  );
};
