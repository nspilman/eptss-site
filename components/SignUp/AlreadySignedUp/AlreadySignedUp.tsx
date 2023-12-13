import { Heading, Text } from "@chakra-ui/react";

interface Props {
  signupsCloseDateLabel?: string;
}

export const AlreadySignedUp = ({ signupsCloseDateLabel }: Props) => {
  if (!signupsCloseDateLabel) {
    throw new Error("signupsCloseDateLabel must be defined");
  }
  return (
    <div>
      <Heading size="lg">{`You're signed up!`}</Heading>
      <Text>
        {signupsCloseDateLabel} and the round will begin promptly after that!
      </Text>
    </div>
  );
};
