import type { Meta, StoryObj } from '@storybook/react';
import { GradientDivider } from '../../src/components';

import { Text } from "@eptss/ui";
const meta = {
  title: '4. Display/Gradient Divider',
  component: GradientDivider,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the divider',
    },
  },
} satisfies Meta<typeof GradientDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <div className="w-full">
      <Text size="sm" color="secondary" className="mb-4">Content above divider</Text>
      <GradientDivider {...args} />
      <Text size="sm" color="secondary" className="mt-4">Content below divider</Text>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="flex items-center gap-4 h-32">
      <div className="flex-1">
        <Text size="sm" color="secondary">Left content</Text>
      </div>
      <GradientDivider {...args} />
      <div className="flex-1">
        <Text size="sm" color="secondary">Right content</Text>
      </div>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 max-w-md">
      <h3 className="text-lg font-semibold text-primary mb-2">Section Title</h3>
      <Text size="sm" color="secondary" className="mb-4">First section content goes here.</Text>

      <GradientDivider />

      <h3 className="text-lg font-semibold text-primary mb-2 mt-4">Another Section</h3>
      <Text size="sm" color="secondary">Second section content goes here.</Text>
    </div>
  ),
};

export const TwoColumnLayout: Story = {
  name: 'Two-Column Layout (Real World Example)',
  render: () => (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
      <div className="flex gap-6">
        {/* Left Column */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-primary mb-2">Primary Actions</h3>
            <Text size="sm" color="secondary">Content for the left side.</Text>
          </div>

          <GradientDivider />

          <div>
            <h3 className="text-base font-semibold text-primary mb-2">Additional Info</h3>
            <Text size="sm" color="secondary">More content below divider.</Text>
          </div>
        </div>

        {/* Vertical Divider */}
        <GradientDivider orientation="vertical" />

        {/* Right Column */}
        <div className="w-44">
          <h3 className="text-sm font-semibold text-primary mb-3">Status</h3>
          <Text size="xs" color="secondary">Right column content.</Text>
        </div>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Horizontal Divider</h3>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <Text size="sm" color="secondary" className="mb-4">Content above</Text>
          <GradientDivider />
          <Text size="sm" color="secondary" className="mt-4">Content below</Text>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Vertical Divider</h3>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 flex items-center gap-6 h-32">
          <div className="flex-1">
            <Text size="sm" color="secondary">Left side</Text>
          </div>
          <GradientDivider orientation="vertical" />
          <div className="flex-1">
            <Text size="sm" color="secondary">Right side</Text>
          </div>
        </div>
      </div>
    </div>
  ),
};
