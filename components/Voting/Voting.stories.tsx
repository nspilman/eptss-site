// Voting.stories.tsx

import React from "react";
import { StoryFn, Meta } from "@storybook/react";
import { Voting, Props } from "./Voting";
import { UserSessionContext } from "components/context/UserSessionContext";

export default {
  title: "Pages/Voting",
  component: Voting,
} as Meta;

const user = {
  id: "anyId",
  app_metadata: {},
  user_metadata: {},
  aud: "anyString",
  created_at: "anyDate",
};

const voteOptions = [
  {
    label: "The Less I Know The Better by Tame Impala",
    field: "1000",
    link: "link",
  },
  {
    label: "Into You by Ariana Grande",
    field: "1001",
    link: "link",
  },
  {
    label: "Better Off Alone by Alice DJ",
    field: "1002",
    link: "link",
  },
];

const Template: StoryFn<Props> = (args) => (
  <UserSessionContext.Provider
    value={{
      isLoading: false,
      user,
    }}
  >
    <Voting {...args} />
  </UserSessionContext.Provider>
);
export const Default = Template.bind({});
Default.args = {
  voteOptions,
  roundId: 1,
  coveringStartsLabel: "Covering Starts on 15th July, 2023",
};

// Additional variants of the Voting component can be added here
