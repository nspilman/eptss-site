import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { Submit, Props } from "./Submit";
import { UserSessionContext } from "components/context/UserSessionContext";
import { User } from "@supabase/auth-helpers-react";
import { AuthError } from "@supabase/supabase-js";

// Define your Storybook configuration
export default {
  title: "Pages/Submit",
  component: Submit,
} as Meta;

const user = {
  id: "anyId",
  app_metadata: {},
  user_metadata: {},
  aud: "anyString",
  created_at: "anyDate",
};

// Define the template for your component
const Template: StoryFn<{
  props: Props;
  user: {
    user?: User;
    isLoading: boolean;
    signOut: () => Promise<{ error: AuthError | null }>;
  };
}> = (args) => (
  <UserSessionContext.Provider value={args.user}>
    <Submit {...args.props} />;
  </UserSessionContext.Provider>
);

export const SubmissionOpenUserAuthed = Template.bind({});
SubmissionOpenUserAuthed.args = {
  user: {
    user,
    isLoading: false,
    signOut: () => Promise.resolve({ error: null }),
  },
  props: {
    roundId: 1,
    phase: "celebration",
    coverClosesLabel: "July 27, 2023",
    listeningPartyLabel: "August 3, 2023",
    song: {
      title: "In the End",
      artist: "Linkin Park",
    },
  },
};

export const SubmissionClosedUserAuthed = Template.bind({});
SubmissionClosedUserAuthed.args = {
  user: {
    user,
    isLoading: false,
    signOut: () => Promise.resolve({ error: null }),
  },
  props: {
    roundId: 1,
    phase: "voting",
    coverClosesLabel: "July 27, 2023",
    listeningPartyLabel: "August 3, 2023",
    song: {
      title: "In the End",
      artist: "Linkin Park",
    },
  },
};

export const UserNotAuthed = Template.bind({});
UserNotAuthed.args = {
  user: {
    isLoading: false,
    signOut: () => Promise.resolve({ error: null }),
  },
  props: {
    roundId: 1,
    phase: "voting",
    coverClosesLabel: "July 27, 2023",
    listeningPartyLabel: "August 3, 2023",
    song: {
      title: "In the End",
      artist: "Linkin Park",
    },
  },
};

export const AuthLoading = Template.bind({});
AuthLoading.args = {
  user: {
    isLoading: true,
    signOut: () => Promise.resolve({ error: null }),
  },
  props: {
    roundId: 1,
    phase: "voting",
    coverClosesLabel: "July 27, 2023",
    listeningPartyLabel: "August 3, 2023",
    song: {
      title: "In the End",
      artist: "Linkin Park",
    },
  },
};
