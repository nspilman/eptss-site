import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { RoundActionCard } from "./RoundActionCard";

const meta: Meta<typeof RoundActionCard> = {
  title: "RoundActionCard",
  component: RoundActionCard,
};

export default meta;
type Story = StoryObj<typeof RoundActionCard>;

export const Primary: Story = {
  args: {
    phase: "signups",
    roundId: 0,
    isAuthed: false,
  },
};

export const Auth: Story = {
  args: {
    phase: "signups",
    roundId: 0,
    isAuthed: true,
    hasSignedUp: true,
    hasVoted: false,
    hasSubmitted: false,
  },
};
