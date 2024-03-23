import { Phase } from "services/PhaseMgmtService";

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
        <button className="btn-main" onClick={onSignupAndJoinRound}>
          I&apos;m in!
        </button>
      );
    } else {
      return <button className="btn-main">Sign Up</button>;
    }
  }
  switch (phase) {
    case "signups":
      return (
        <button
          className="btn-main"
          disabled={hasCompletedPhase}
          onClick={onJoinRound}
        >
          {hasCompletedPhase ? `You're in!` : `I'm in!`}
        </button>
      );

    case "voting":
      return (
        <>
          <RoundDetailsButton />
          <button
            className="btn-main"
            onClick={onVote}
            disabled={hasCompletedPhase}
          >
            {hasCompletedPhase ? "You've Voted" : "Vote Now"}
          </button>
        </>
      );

    case "covering":
      return (
        <>
          <RoundDetailsButton />
          <button
            className="btn-main"
            disabled={hasCompletedPhase}
            onClick={onSubmit}
          >
            {hasCompletedPhase ? `You've Submitted!` : "Submit My Cover"}
          </button>
        </>
      );
    case "celebration":
      return (
        <>
          <RoundDetailsButton />
          {hasCompletedPhase ? (
            <button className="btn-main" onClick={() => console.log("profile")}>
              Profile
            </button>
          ) : (
            <button className="btn-main" onClick={onSubmit}>
              Submit My Cover
            </button>
          )}
        </>
      );
  }
};
