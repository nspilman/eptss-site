import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ShadowsSection } from '../components/ShadowsSection';

const meta: Meta<typeof ShadowsSection> = {
  title: 'Theme/Shadows',
  component: ShadowsSection,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ShadowsSection>;

export const Default: Story = {};
