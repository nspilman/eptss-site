import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Badge from '../../src/components/ui/primitives/badge';
import { ThemeSection } from '../components/ThemeSection';

const meta: Meta<typeof Badge> = {
  title: '4. Display/Badge',
  component: Badge,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const AllVariants: Story = {
  render: () => (
    <ThemeSection
      title="Badge Variants"
      description="Different badge styles for various use cases"
    >
      <div className="flex flex-wrap gap-4">
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2 text-[var(--color-primary)]">Status Badges</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Active</Badge>
            <Badge variant="secondary">Pending</Badge>
            <Badge variant="destructive">Error</Badge>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2 text-[var(--color-primary)]">Category Badges</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Music</Badge>
            <Badge variant="outline">Art</Badge>
            <Badge variant="outline">Tech</Badge>
          </div>
        </div>
      </div>
    </ThemeSection>
  ),
};
