import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { UtilitiesSection } from '../components/UtilitiesSection';

const meta: Meta<typeof UtilitiesSection> = {
  title: '6. Animation/Utilities',
  component: UtilitiesSection,
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
type Story = StoryObj<typeof UtilitiesSection>;

export const Default: Story = {};
