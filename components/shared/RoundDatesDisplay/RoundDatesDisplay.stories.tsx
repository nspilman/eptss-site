import React from "react";

import { RoundDatesDisplayPopup, Props } from "./RoundDatesDisplay";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Components/RoundDatesDisplayPopup",
  component: RoundDatesDisplayPopup,
} as Meta;

const Template: StoryFn<Props> = (args: Props) => (
  <RoundDatesDisplayPopup {...args} />
);

export const CurrentRound = Template.bind({});
CurrentRound.args = {
  current: {
    signupOpens: new Date(2023, 8, 1).toDateString(),
    votingOpens: new Date(2023, 8, 15).toDateString(),
    coveringBegins: new Date(2023, 8, 20).toDateString(),
    coversDue: new Date(2023, 8, 27).toDateString(),
    listeningParty: new Date(2023, 9, 1).toDateString(),
  },
  next: {
    signupOpens: new Date(2023, 9, 15).toDateString(),
    votingOpens: new Date(2023, 9, 30).toDateString(),
    coveringBegins: new Date(2023, 10, 5).toDateString(),
    coversDue: new Date(2023, 10, 12).toDateString(),
    listeningParty: new Date(2023, 11, 1).toDateString(),
  },
};

export const NextRound = Template.bind({});
NextRound.args = {
  current: {
    signupOpens: new Date(2023, 7, 15).toDateString(),
    votingOpens: new Date(2023, 7, 30).toDateString(),
    coveringBegins: new Date(2023, 8, 5).toDateString(),
    coversDue: new Date(2023, 8, 12).toDateString(),
    listeningParty: new Date(2023, 9, 1).toDateString(),
  },
  next: {
    signupOpens: new Date(2023, 8, 1).toDateString(),
    votingOpens: new Date(2023, 8, 15).toDateString(),
    coveringBegins: new Date(2023, 8, 20).toDateString(),
    coversDue: new Date(2023, 8, 27).toDateString(),
    listeningParty: new Date(2023, 9, 1).toDateString(),
  },
};
