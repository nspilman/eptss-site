import type { Preview } from "@storybook/react";
import React from "react";
import { UserSessionProvider } from "../components/context/UserSessionContext";
import { RoundProvider } from "../components/context/RoundContext";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export const decorators = [
  (Story) => {
    return (
      <RoundProvider>
        <UserSessionProvider>
          <Story />
        </UserSessionProvider>
      </RoundProvider>
    );
  },
];

export default preview;
