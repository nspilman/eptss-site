import type { Meta, StoryObj } from "@storybook/react";

import { Hero } from "./Hero";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta: Meta<typeof Hero> = {
  title: "Hero",
  component: Hero,
  argTypes: {
    backgroundColor: {
      control: "color",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const Primary: Story = {};
