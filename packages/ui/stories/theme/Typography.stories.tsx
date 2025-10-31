import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { TypographySection } from '../components/TypographySection';

const meta: Meta<typeof TypographySection> = {
  title: 'Theme/Typography',
  component: TypographySection,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TypographySection>;

export const Default: Story = {};
