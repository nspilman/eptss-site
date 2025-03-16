import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ContainerQueriesSection } from '../components/ContainerQueriesSection';

const meta: Meta<typeof ContainerQueriesSection> = {
  title: 'Theme/Container Queries',
  component: ContainerQueriesSection,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContainerQueriesSection>;

export const Default: Story = {};
