import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { SignUp } from "./SignUp";
import { User } from "@supabase/auth-helpers-react";
import { UserSessionContext } from "components/context/UserSessionContext";
import { AuthError } from "@supabase/supabase-js";
import { RoundContext } from "components/context/RoundContext";
import { Phase } from "services/PhaseMgmtService";

// Define your Storybook configuration
export default {
  title: "Pages/SignUp",
  component: SignUp,
} as Meta;

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

// Define the template for your component
const Template: StoryFn<{
  round: {
    isLoading: boolean;
    roundId?: number | undefined;
    phase?: Phase | undefined;
    dateLabels?: Record<Phase, Record<"opens" | "closes", string>>;
  };
  user: {
    user?: User;
    isLoading: boolean;
    signOut: () => Promise<{ error: AuthError | null }>;
    userRoundDetails: {
      hasSignedUp: boolean;
      hasSubmitted: boolean;
      hasVoted: boolean;
    };
  };
}> = (args) => (
  <RoundContext.Provider value={args.round}>
    <UserSessionContext.Provider value={args.user}>
      <SignUp />
    </UserSessionContext.Provider>
  </RoundContext.Provider>
);

export const SignupsOpenUserSignedIn = Template.bind({});
SignupsOpenUserSignedIn.args = {
  round: {
    roundId: 1,
    dateLabels,
    phase: "signups",
    isLoading: false,
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
    signOut: () => Promise.resolve({ error: null }),
    userRoundDetails: {
      hasSignedUp: false,
      hasSubmitted: false,
      hasVoted: false,
    },
  },
};

export const SignupsOpenUserSignedInRound21 = Template.bind({});
SignupsOpenUserSignedInRound21.args = {
  round: {
    roundId: 21,
    dateLabels,
    phase: "signups",
    isLoading: false,
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
    signOut: () => Promise.resolve({ error: null }),
    userRoundDetails: {
      hasSignedUp: false,
      hasSubmitted: false,
      hasVoted: false,
    },
  },
};

export const SignupsClosed = Template.bind({});
SignupsClosed.args = {
  round: {
    roundId: 1,
    dateLabels,
    phase: "voting",
    isLoading: false,
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
    signOut: () => Promise.resolve({ error: null }),
    userRoundDetails: {
      hasSignedUp: false,
      hasSubmitted: false,
      hasVoted: false,
    },
  },
};

export const SignupsOpenUserLoading = Template.bind({});
SignupsOpenUserLoading.args = {
  round: {
    roundId: 1,
    dateLabels,
    phase: "signups",
    isLoading: false,
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
    signOut: () => Promise.resolve({ error: null }),
    userRoundDetails: {
      hasSignedUp: false,
      hasSubmitted: false,
      hasVoted: false,
    },
  },
};

export const SignupsOpenNoAuthUser = Template.bind({});
SignupsOpenNoAuthUser.args = {
  round: {
    roundId: 1,
    dateLabels,
    phase: "signups",
    isLoading: false,
  },
  user: {
    isLoading: false,
    signOut: () => Promise.resolve({ error: null }),
    userRoundDetails: {
      hasSignedUp: false,
      hasSubmitted: false,
      hasVoted: false,
    },
  },
};

export const SignupsAuthUserIsSignedUp = Template.bind({});
SignupsAuthUserIsSignedUp.args = {
  round: {
    roundId: 1,
    dateLabels,
    phase: "signups",
    isLoading: false,
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
    signOut: () => Promise.resolve({ error: null }),
    userRoundDetails: {
      hasSignedUp: true,
      hasSubmitted: false,
      hasVoted: false,
    },
  },
};
