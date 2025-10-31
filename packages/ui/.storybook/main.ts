import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import path from "path";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    {
      name: "@storybook/addon-storysource",
      options: {
        loaderOptions: {
          prettierConfig: { printWidth: 80, singleQuote: true },
        },
      },
    },
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      define: {
        'process.env': {},
      },
      resolve: {
        alias: {
          'next/link': path.resolve(__dirname, './mocks/next-link.tsx'),
        },
      },
    });
  },
};

export default config;
