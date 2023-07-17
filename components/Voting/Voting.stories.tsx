// Voting.stories.tsx

import React from "react";
import { StoryFn, Meta } from "@storybook/react";
import { Voting, Props } from "./Voting";
import { UserSessionContext } from "components/context/UserSessionContext";
import { AuthError, User } from "@supabase/supabase-js";
import { RoundContext } from "components/context/RoundContext";
import { Phase } from "services/PhaseMgmtService";

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

const dateLabels = {
  signups: {
    opens: "Signups Open: July 1, 2023",
    closes: "Signups Close: July 7, 2023",
  },
  voting: {
    opens: "Voting Opens: July 8, 2023",
    closes: "Voting Closes: July 15, 2023",
  },
  covering: {
    opens: "Covering Phase Begins: July 16, 2023",
    closes: "Covering Phase Ends: July 23, 2023",
  },
  celebration: {
    opens: "Celebration Starts: July 24, 2023",
    closes: "Celebration Ends: July 31, 2023",
  },
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

const Template: StoryFn<{
  props: Props;
  user: {
    isLoading: boolean;
    user?: User;
    signOut: () => Promise<{
      error: AuthError | null;
    }>;
    userRoundDetails: {
      hasSignedUp: boolean;
      hasSubmitted: boolean;
      hasVoted: boolean;
    };
  };
  round: {
    isLoading: boolean;
    roundId?: number | undefined;
    phase?: Phase | undefined;
    dateLabels?: Record<Phase, Record<"opens" | "closes", string>> | undefined;
  };
}> = (args) => (
  <RoundContext.Provider value={args.round}>
    <UserSessionContext.Provider value={args.user}>
      <Voting {...args.props} />
    </UserSessionContext.Provider>
  </RoundContext.Provider>
);
export const VotingFormOpenAuthedUser = Template.bind({});
VotingFormOpenAuthedUser.args = {
  props: {
    voteOptions,
    roundId: 1,
    coveringStartsLabel: "Covering Starts on 15th July, 2023",
  },
  user: {
    user,
    isLoading: false,
    userRoundDetails: {
      hasSignedUp: false,
      hasSubmitted: false,
      hasVoted: false,
    },
    signOut: () => Promise.resolve({ error: null }),
  },
  round: {
    isLoading: false,
    roundId: 2,
    phase: "voting",
    dateLabels,
  },
};

export const NoUser = Template.bind({});
NoUser.args = {
  props: {
    voteOptions,
    roundId: 1,
    coveringStartsLabel: "Covering Starts on 15th July, 2023",
  },
  user: {
    isLoading: false,
    userRoundDetails: {
      hasSignedUp: false,
      hasSubmitted: false,
      hasVoted: false,
    },
    signOut: () => Promise.resolve({ error: null }),
  },
  round: {
    isLoading: false,
    roundId: 2,
    phase: "voting",
    dateLabels,
  },
};

export const AuthUserAlreadyVoted = Template.bind({});
AuthUserAlreadyVoted.args = {
  props: {
    voteOptions,
    roundId: 1,
    coveringStartsLabel: "Covering Starts on 15th July, 2023",
  },
  user: {
    user,
    isLoading: false,
    userRoundDetails: {
      hasSignedUp: true,
      hasSubmitted: false,
      hasVoted: true,
    },
    signOut: () => Promise.resolve({ error: null }),
  },
  round: {
    isLoading: false,
    roundId: 2,
    phase: "voting",
    dateLabels,
  },
};

export const VotingClosed = Template.bind({});
VotingClosed.args = {
  props: {
    voteOptions,
    roundId: 1,
    coveringStartsLabel: "Covering Starts on 15th July, 2023",
  },
  user: {
    user,
    isLoading: false,
    userRoundDetails: {
      hasSignedUp: true,
      hasSubmitted: false,
      hasVoted: true,
    },
    signOut: () => Promise.resolve({ error: null }),
  },
  round: {
    isLoading: false,
    roundId: 2,
    phase: "signups",
    dateLabels,
  },
};
