import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { ThemeSection } from '../components/ThemeSection';

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
          <p className="text-xs text-[var(--color-secondary)]">Small</p>
          <LoadingSpinner className="h-4 w-4" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[var(--color-secondary)]">Medium</p>
          <LoadingSpinner className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[var(--color-secondary)]">Large</p>
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
            <span className="text-sm text-[var(--color-primary)]">Loading content...</span>
          </div>
        </div>

        <div className="p-8 border border-[var(--color-border-primary)] rounded-lg flex items-center justify-center">
          <div className="text-center space-y-3">
            <LoadingSpinner className="h-8 w-8 mx-auto" />
            <p className="text-sm text-[var(--color-secondary)]">Please wait...</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-primary)] text-[var(--color-background-primary)] rounded-md">
          <LoadingSpinner className="h-4 w-4" />
          <span className="text-sm font-medium">Processing...</span>
        </div>
      </div>
    </ThemeSection>
  ),
};
