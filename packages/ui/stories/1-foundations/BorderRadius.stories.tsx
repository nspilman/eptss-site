import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { BorderRadiusSection } from '../components/BorderRadiusSection';

const meta: Meta<typeof BorderRadiusSection> = {
  title: 'Theme/Border Radius',
  component: BorderRadiusSection,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BorderRadiusSection>;

export const Default: Story = {};
