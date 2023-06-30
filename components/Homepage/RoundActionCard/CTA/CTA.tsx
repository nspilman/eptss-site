import { Button, Text } from "@chakra-ui/react";
import { Phase } from "services/PhaseMgmtService";

export interface RoundActionFunctions {
  onProfile: () => void;
  onSignup: () => void;
  onSignupAndJoinRound: () => void;
  onJoinRound: () => void;
  onVote: () => void;
  onSubmit: () => void;
  onRoundDetails: () => void;
}

interface Props {
  roundActionFunctions: RoundActionFunctions;
  roundId: number;
  phase: Phase;
  isAuthed: boolean;
  hasCompletedPhase: boolean;
}

export const CTA = ({
  roundActionFunctions,
  roundId,
  isAuthed,
  phase,
  hasCompletedPhase,
}: Props) => {
  const {
    onProfile,
    onSignup,
    onSignupAndJoinRound,
    onJoinRound,
    onVote,
    onSubmit,
    onRoundDetails,
  } = roundActionFunctions;

  const RoundDetailsButton = () => (
    <Button onClick={onRoundDetails}>{`Round ${roundId} Details`}</Button>
  );

  if (!isAuthed) {
    if (phase === "signups") {
      return <Button onClick={onSignupAndJoinRound}>I&apos;m in!</Button>;
    } else {
      return <Button onClick={onSignup}>Sign Up</Button>;
    }
  }
  switch (phase) {
    case "signups":
      return (
        <Button isDisabled={hasCompletedPhase} onClick={onJoinRound}>
          {hasCompletedPhase ? `You're in!` : `I'm in!`}
        </Button>
      );

    case "voting":
      return (
        <>
          <RoundDetailsButton />
          <Button onClick={onVote} isDisabled={hasCompletedPhase}>
            {hasCompletedPhase ? "You've Voted" : "Vote Now"}
          </Button>
        </>
      );

    case "covering":
      return (
        <>
          <RoundDetailsButton />
          <Button isDisabled={hasCompletedPhase} onClick={onSubmit}>
            {hasCompletedPhase ? `You've Submitted!` : "Submit My Cover"}
          </Button>
        </>
      );
    case "celebration":
      return (
        <>
          <RoundDetailsButton />
          {hasCompletedPhase ? (
            <Button onClick={onProfile}>Profile</Button>
          ) : (
            <Button onClick={onSubmit}>Submit My Cover</Button>
          )}
        </>
      );
  }
};
