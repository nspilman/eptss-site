import { Phase } from "@/types";
import { Button } from "@/components/ui/button";

export interface RoundActionFunctions {
  // onProfile: () => void;
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
    // onProfile,
    onSignupAndJoinRound,
    onJoinRound,
    onVote,
    onSubmit,
    onRoundDetails,
  } = roundActionFunctions;

  const RoundDetailsButton = () => (
    <button onClick={onRoundDetails}>{`Round ${roundId} Details`}</button>
  );

  if (!isAuthed) {
    if (phase === "signups") {
      return (
        <Button className="btn-main" onClick={onSignupAndJoinRound}>
          I&apos;m in!
        </Button>
      );
    } else {
      return <Button className="btn-main">Login</Button>;
    }
  }
  switch (phase) {
    case "signups":
      return (
        <Button
          className="btn-main"
          disabled={hasCompletedPhase}
          onClick={onJoinRound}
        >
          {hasCompletedPhase ? `You're in!` : `I'm in!`}
        </Button>
      );

    case "voting":
      return (
        <>
          <RoundDetailsButton />
          <Button
            className="btn-main"
            onClick={onVote}
            disabled={hasCompletedPhase}
          >
            {hasCompletedPhase ? "You've Voted" : "Vote Now"}
          </Button>
        </>
      );

    case "covering":
      return (
        <>
          <RoundDetailsButton />
          <Button
            className="btn-main"
            disabled={hasCompletedPhase}
            onClick={onSubmit}
          >
            {hasCompletedPhase ? `You've Submitted!` : "Submit My Cover"}
          </Button>
        </>
      );
    case "celebration":
      return (
        <>
          <RoundDetailsButton />
          {hasCompletedPhase ? (
            <Button className="btn-main" onClick={() => console.log("profile")}>
              Profile
            </Button>
          ) : (
            <Button className="btn-main" onClick={onSubmit}>
              Submit My Cover
            </Button>
          )}
        </>
      );
  }
};
