import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { SpacingSection } from '../components/SpacingSection';

const meta: Meta<typeof SpacingSection> = {
  title: 'Theme/Spacing',
  component: SpacingSection,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SpacingSection>;

export const Default: Story = {};
