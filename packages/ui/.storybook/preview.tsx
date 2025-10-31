import type { Preview } from "@storybook/react";
import React from "react";
import "../src/styles/index.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      expanded: true,
    },
    docs: {
      theme: 'dark',
      source: {
        type: 'dynamic',
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0a0a14',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
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
