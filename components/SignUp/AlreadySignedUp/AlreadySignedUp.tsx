import { Heading } from "@chakra-ui/react";

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
      <span className="text-md font-light font-roboto text-white">
        {signupsCloseDateLabel} and the round will begin promptly after that!
      </span>
    </div>
  );
};
