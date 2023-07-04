import type { Meta, StoryObj } from "@storybook/react";
import { add } from "date-fns";

import { RoundActionCard } from "./RoundActionCard";

const meta: Meta<typeof RoundActionCard> = {
  title: "RoundActionCard",
  component: RoundActionCard,
};

export default meta;
type Story = StoryObj<typeof RoundActionCard>;

const anyBooleanValue = false;
const anyRoundId = 2;
const twoDaysFromNow = add(new Date(), { days: 2 }).toString();
console.log({ twoDaysFromNow });

const roundActionFunctions = {
  onProfile: () => {},
  onSignup: () => {},
  onSignupAndJoinRound: () => {},
  onJoinRound: () => {},
  onVote: () => {},
  onSubmit: () => {},
  onRoundDetails: () => {},
};

export const SignupsClosedUserUnauthed: Story = {
  name: "UnAuthed user and Signups are closed",
  args: {
    phase: "celebration",
    roundId: anyRoundId,
    isAuthed: false,
    hasCompletedPhase: anyBooleanValue,
    roundActionFunctions,
  },
};

export const SignupPhaseUserUnauthed: Story = {
  name: "UnAuthed user and Signups are open",
  args: {
    phase: "signups",
    roundId: anyRoundId,
    isAuthed: false,
    hasCompletedPhase: anyBooleanValue,
    roundActionFunctions,
    phaseEndsDate: twoDaysFromNow,
  },
};

export const SignupPhaseUserAuthed: Story = {
  name: "Authed user and Signups are open - user has not signed up for round",
  args: {
    phase: "signups",
    roundId: anyRoundId,
    isAuthed: true,
    hasCompletedPhase: false,
    roundActionFunctions,
    phaseEndsDate: twoDaysFromNow,
  },
};

export const SignupPhaseUserAuthedAndSignedUp: Story = {
  name: "Authed user and Signups are open - user has signed up for round",
  args: {
    phase: "signups",
    roundId: anyRoundId,
    isAuthed: true,
    hasCompletedPhase: true,
    roundActionFunctions,
    phaseEndsDate: twoDaysFromNow,
  },
};

export const VotingPhaseUserNotVoted: Story = {
  name: "Authed user and voting is open - user has not voted",
  args: {
    phase: "voting",
    roundId: anyRoundId,
    isAuthed: true,
    hasCompletedPhase: false,
    roundActionFunctions,
    phaseEndsDate: twoDaysFromNow,
  },
};

export const VotingPhaseAuthUserVoted: Story = {
  name: "Authed user and voting is open - user has voted",
  args: {
    phase: "voting",
    roundId: anyRoundId,
    isAuthed: true,
    hasCompletedPhase: true,
    roundActionFunctions,
    phaseEndsDate: twoDaysFromNow,
  },
};

export const CoveringPhaseAuthUserHasNotSubmitted: Story = {
  name: "Authed user and covering phase - user has not submitted",
  args: {
    phase: "covering",
    roundId: anyRoundId,
    isAuthed: true,
    hasCompletedPhase: false,
    roundActionFunctions,
    phaseEndsDate: twoDaysFromNow,
  },
};

export const CoveringPhaseAuthUserHasSubmitted: Story = {
  args: {
    phase: "covering",
    roundId: anyRoundId,
    isAuthed: true,
    hasCompletedPhase: true,
    roundActionFunctions,
    phaseEndsDate: twoDaysFromNow,
  },
};

export const AuthWaiting: Story = {
  args: {
    phase: "celebration",
    roundId: anyRoundId,
    isAuthed: true,
    hasCompletedPhase: true,
    roundActionFunctions,
  },
};

export const CelebrationStartedUserNotYetSubmitted: Story = {
  args: {
    phase: "celebration",
    roundId: anyRoundId,
    isAuthed: true,
    hasCompletedPhase: false,
    roundActionFunctions,
  },
};

export const Loading: Story = {
  args: {
    phase: "covering",
    roundId: anyRoundId,
    isAuthed: anyBooleanValue,
    hasCompletedPhase: anyBooleanValue,
    loading: true,
    roundActionFunctions,
  },
};
