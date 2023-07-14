import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SignUp, Props } from "./SignUp";
import { User } from "@supabase/auth-helpers-react";
import { UserSessionContext } from "components/context/UserSessionContext";

// Define your Storybook configuration
export default {
  title: "Components/SignUp",
  component: SignUp,
} as Meta;

// Define the template for your component
const Template: StoryFn<{
  props: Props;
  user: { user?: User; isLoading: boolean };
}> = (args) => (
  <UserSessionContext.Provider value={args.user}>
    <SignUp {...args.props} />
  </UserSessionContext.Provider>
);

export const SignupsOpenUserSignedIn = Template.bind({});
SignupsOpenUserSignedIn.args = {
  props: {
    roundId: 1,
    signupsCloseDateLabel: "July 27, 2023",
    areSignupsOpen: true,
  },
  user: {
    user: {
      id: "anyId",
      app_metadata: {},
      user_metadata: {},
      aud: "anyString",
      created_at: "anyDate",
    },
    isLoading: false,
  },
};

export const SignupsClosed = Template.bind({});
SignupsClosed.args = {
  props: {
    roundId: 1,
    signupsCloseDateLabel: "July 27, 2023",
    areSignupsOpen: false,
  },
};

export const SignupsOpenUserLoading = Template.bind({});
SignupsOpenUserLoading.args = {
  props: {
    roundId: 1,
    signupsCloseDateLabel: "July 27, 2023",
    areSignupsOpen: true,
  },
  user: {
    user: {
      id: "anyId",
      app_metadata: {},
      user_metadata: {},
      aud: "anyString",
      created_at: "anyDate",
    },
    isLoading: true,
  },
};

export const SignupsOpenNoAuthUser = Template.bind({});
SignupsOpenNoAuthUser.args = {
  props: {
    roundId: 1,
    signupsCloseDateLabel: "July 27, 2023",
    areSignupsOpen: true,
  },
  user: {
    isLoading: false,
  },
};
