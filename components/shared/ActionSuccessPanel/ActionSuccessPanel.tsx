import { Heading, Stack, Text } from "@chakra-ui/react";
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
    blurSrc?: string;
  };
}

export const ActionSuccessPanel = ({
  text: { header, body, thankyou },
  image: { src, alt, blurSrc },
}: Props) => {
  return (
    <Stack alignItems="center">
      <Heading as="h1" size="md" textAlign="center" fontWeight="300">
        {header}
      </Heading>
      <Text textAlign="center" fontWeight="200" my="4">
        {body}
      </Text>
      <Image
        src={src}
        alt={alt}
        width={500}
        height={500}
        placeholder={"blur"}
        blurDataURL={blurSrc}
      />
      <Text fontWeight="200" my="4">
        {thankyou}
      </Text>
      <Link href="/#rounds">
        <button className="btn-main">Home</button>
      </Link>
    </Stack>
  );
};
