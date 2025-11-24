import type { Meta, StoryObj } from '@storybook/react';
import { GradientDivider } from '../../src/components';

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
      <p className="text-sm text-secondary mb-4">Content above divider</p>
      <GradientDivider {...args} />
      <p className="text-sm text-secondary mt-4">Content below divider</p>
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
        <p className="text-sm text-secondary">Left content</p>
      </div>
      <GradientDivider {...args} />
      <div className="flex-1">
        <p className="text-sm text-secondary">Right content</p>
      </div>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 max-w-md">
      <h3 className="text-lg font-semibold text-primary mb-2">Section Title</h3>
      <p className="text-sm text-secondary mb-4">First section content goes here.</p>

      <GradientDivider />

      <h3 className="text-lg font-semibold text-primary mb-2 mt-4">Another Section</h3>
      <p className="text-sm text-secondary">Second section content goes here.</p>
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
            <p className="text-sm text-secondary">Content for the left side.</p>
          </div>

          <GradientDivider />

          <div>
            <h3 className="text-base font-semibold text-primary mb-2">Additional Info</h3>
            <p className="text-sm text-secondary">More content below divider.</p>
          </div>
        </div>

        {/* Vertical Divider */}
        <GradientDivider orientation="vertical" />

        {/* Right Column */}
        <div className="w-44">
          <h3 className="text-sm font-semibold text-primary mb-3">Status</h3>
          <p className="text-xs text-secondary">Right column content.</p>
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
          <p className="text-sm text-secondary mb-4">Content above</p>
          <GradientDivider />
          <p className="text-sm text-secondary mt-4">Content below</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Vertical Divider</h3>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 flex items-center gap-6 h-32">
          <div className="flex-1">
            <p className="text-sm text-secondary">Left side</p>
          </div>
          <GradientDivider orientation="vertical" />
          <div className="flex-1">
            <p className="text-sm text-secondary">Right side</p>
          </div>
        </div>
      </div>
    </div>
  ),
};
