import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { AnimationsSection } from '../components/AnimationsSection';

const meta: Meta<typeof AnimationsSection> = {
  title: '6. Animation/Animations',
  component: AnimationsSection,
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
type Story = StoryObj<typeof AnimationsSection>;

export const Default: Story = {};
