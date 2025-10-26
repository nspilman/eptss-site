import type { Preview } from "@storybook/react";
import React from "react";
import "@eptss/ui/styles";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    // backgrounds: {
    //   default: 'dark',
    //   values: [
    //     {
    //       name: 'dark',
    //       value: , // --color-primary
    //     },
    //     {
    //       name: 'light',
    //       value: '#ffffff', // --color-white
    //     },
    //   ],
    // },
    docs: {
      theme: 'dark',
    },
  },
};

export const decorators = [
  (Story) => {
    return (
      <div className="min-h-screen p-4 bg-background-primary text-primary">
        <Story />
      </div>
    );
  },
];

export default preview;
