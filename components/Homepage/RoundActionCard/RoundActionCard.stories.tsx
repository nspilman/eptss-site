import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { RoundActionCard } from "./RoundActionCard";

const meta: Meta<typeof RoundActionCard> = {
  title: "RoundActionCard",
  component: RoundActionCard,
};

export default meta;
type Story = StoryObj<typeof RoundActionCard>;

export const UnauthWaiting: Story = {
  args: {
    phase: "celebration",
    roundId: 0,
    isAuthed: false,
  },
};

export const UnauthSignups: Story = {
  args: {
    phase: "signups",
    roundId: 0,
    isAuthed: false,
  },
};

export const AuthSignupNo: Story = {
  args: {
    phase: "signups",
    roundId: 0,
    isAuthed: true,
    hasSignedUp: false,
    hasVoted: false,
    hasSubmitted: false,
  },
};

export const AuthSignupYes: Story = {
  args: {
    phase: "signups",
    roundId: 0,
    isAuthed: true,
    hasSignedUp: true,
    hasVoted: false,
    hasSubmitted: false,
  },
};

export const AuthVotingNo: Story = {
  args: {
    phase: "voting",
    roundId: 0,
    isAuthed: true,
    hasSignedUp: true,
    hasVoted: false,
    hasSubmitted: false,
  },
};

export const AuthVotingYes: Story = {
  args: {
    phase: "voting",
    roundId: 0,
    isAuthed: true,
    hasSignedUp: true,
    hasVoted: true,
    hasSubmitted: false,
  },
};

export const AuthSubmitNo: Story = {
  args: {
    phase: "covering",
    roundId: 0,
    isAuthed: true,
    hasSignedUp: true,
    hasVoted: true,
    hasSubmitted: false,
  },
};

export const AuthSubmitYes: Story = {
  args: {
    phase: "covering",
    roundId: 0,
    isAuthed: true,
    hasSignedUp: true,
    hasVoted: true,
    hasSubmitted: true,
  },
};

export const AuthWaiting: Story = {
  args: {
    phase: "celebration",
    roundId: 0,
    isAuthed: true,
    hasSignedUp: true,
    hasVoted: true,
    hasSubmitted: true,
  },
};

export const Loading: Story = {
  args: {
    phase: "celebration",
    roundId: 0,
    loading: true,
  },
};
