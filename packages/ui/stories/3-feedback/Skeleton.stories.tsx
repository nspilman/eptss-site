import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '../../src/components/ui/primitives/skeleton';
import { ThemeSection } from '../components/ThemeSection';

import { Text } from "@eptss/ui";
const meta: Meta<typeof Skeleton> = {
  title: '3. Feedback/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => <Skeleton className="h-12 w-64" />,
};

export const Shapes: Story = {
  render: () => (
    <ThemeSection
      title="Skeleton Shapes"
      description="Different skeleton loading shapes"
    >
      <div className="space-y-6">
        <div>
          <Text size="xs" className="text-[var(--color-secondary)] mb-2">Line</Text>
          <Skeleton className="h-4 w-full" />
        </div>

        <div>
          <Text size="xs" className="text-[var(--color-secondary)] mb-2">Short Line</Text>
          <Skeleton className="h-4 w-64" />
        </div>

        <div>
          <Text size="xs" className="text-[var(--color-secondary)] mb-2">Circle</Text>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>

        <div>
          <Text size="xs" className="text-[var(--color-secondary)] mb-2">Card</Text>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </ThemeSection>
  ),
};

export const CardLoading: Story = {
  render: () => (
    <ThemeSection
      title="Card Loading State"
      description="Example of a card loading skeleton"
    >
      <div className="space-y-4 max-w-md">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </ThemeSection>
  ),
};

export const ListLoading: Story = {
  render: () => (
    <ThemeSection
      title="List Loading State"
      description="Example of a list loading skeleton"
    >
      <div className="space-y-4 max-w-md">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </ThemeSection>
  ),
};
