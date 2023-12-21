interface Props {
  signupsCloseDateLabel?: string;
}

export const AlreadySignedUp = ({ signupsCloseDateLabel }: Props) => {
  if (!signupsCloseDateLabel) {
    throw new Error("signupsCloseDateLabel must be defined");
  }
  return (
    <div>
      <h2 className="font-fraunces text-white font-bold">{`You're signed up!`}</h2>
      <span className="text-md font-light font-roboto text-white">
        {signupsCloseDateLabel} and the round will begin promptly after that!
      </span>
    </div>
  );
};
