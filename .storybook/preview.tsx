import type { Preview } from "@storybook/react";
import React from "react";
import { UserSessionProvider } from "../components/context/UserSessionContext";
import { RoundProvider } from "../components/context/RoundContext";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "../styles";
import "../styles/globals.css";

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
      <ChakraProvider theme={theme}>
        <RoundProvider>
          <UserSessionProvider>
            <Story />
          </UserSessionProvider>
        </RoundProvider>
      </ChakraProvider>
    );
  },
];

export default preview;
