import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ColorsSection } from '../components/ColorSection';

const meta: Meta<typeof ColorsSection> = {
  title: 'Theme/Colors',
  component: ColorsSection,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      options: [
        { name: 'dark', value: '#0a0a14' },
        { name: 'light', value: '#ffffff' }
      ]
    },
  },
};

export default meta;
type Story = StoryObj<typeof ColorsSection>;

export const Default: Story = {};
