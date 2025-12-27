import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { ThemeSection } from '../components/ThemeSection';

import { Text } from "@eptss/ui";
const meta: Meta<typeof LoadingSpinner> = {
  title: '3. Feedback/Loading Spinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <ThemeSection
      title="Loading Spinner Sizes"
      description="Different sizes of loading spinners"
    >
      <div className="flex items-center gap-8">
        <div className="space-y-2">
          <Text size="xs" className="text-[var(--color-secondary)]">Small</Text>
          <LoadingSpinner className="h-4 w-4" />
        </div>

        <div className="space-y-2">
          <Text size="xs" className="text-[var(--color-secondary)]">Medium</Text>
          <LoadingSpinner className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <Text size="xs" className="text-[var(--color-secondary)]">Large</Text>
          <LoadingSpinner className="h-12 w-12" />
        </div>
      </div>
    </ThemeSection>
  ),
};

export const InContext: Story = {
  render: () => (
    <ThemeSection
      title="Loading Spinner in Context"
      description="Examples of loading spinners in different contexts"
    >
      <div className="space-y-6">
        <div className="p-4 border border-[var(--color-border-primary)] rounded-lg">
          <div className="flex items-center gap-3">
            <LoadingSpinner className="h-5 w-5" />
            <Text as="span" size="sm" className="text-[var(--color-primary)]">Loading content...</Text>
          </div>
        </div>

        <div className="p-8 border border-[var(--color-border-primary)] rounded-lg flex items-center justify-center">
          <div className="text-center space-y-3">
            <LoadingSpinner className="h-8 w-8 mx-auto" />
            <Text size="sm" className="text-[var(--color-secondary)]">Please wait...</Text>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-primary)] text-[var(--color-background-primary)] rounded-md">
          <LoadingSpinner className="h-4 w-4" />
          <Text as="span" size="sm" weight="medium">Processing...</Text>
        </div>
      </div>
    </ThemeSection>
  ),
};
