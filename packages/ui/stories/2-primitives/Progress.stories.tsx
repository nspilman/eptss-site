import React, { useState, useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Progress } from '../../src/components/ui/primitives/progress';
import { ThemeSection } from '../components/ThemeSection';
import { Text } from '@eptss/ui';

const meta: Meta<typeof Progress> = {
  title: '2. Primitives/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      options: [
        { name: 'dark', value: '#0a0a14' },
        { name: 'light', value: '#ffffff' }
      ]
    },
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value (0-100)',
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the progress bar',
    },
    showLabel: {
      control: 'boolean',
      description: 'Show percentage/label',
    },
    labelPosition: {
      control: 'select',
      options: ['top', 'right', 'bottom'],
      description: 'Label position',
    },
    label: {
      control: 'text',
      description: 'Custom label text (overrides percentage)',
    },
    animated: {
      control: 'boolean',
      description: 'Animate the indicator with pulse effect',
    },
    indicatorVariant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
      description: 'Color of the indicator bar',
    },
  },
  args: {
    value: 65,
    variant: 'default',
    size: 'md',
    showLabel: false,
    labelPosition: 'top',
    animated: false,
  }
};

export default meta;
type Story = StoryObj<typeof Progress>;

// Basic Stories
export const Default: Story = {
  args: {
    value: 65,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const WithLabelTop: Story = {
  args: {
    value: 75,
    showLabel: true,
    labelPosition: 'top',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const WithLabelRight: Story = {
  args: {
    value: 60,
    showLabel: true,
    labelPosition: 'right',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const WithLabelBottom: Story = {
  args: {
    value: 80,
    showLabel: true,
    labelPosition: 'bottom',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const CustomLabel: Story = {
  args: {
    value: 50,
    showLabel: true,
    label: 'Uploading files...',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

// Variant Stories
export const Success: Story = {
  args: {
    value: 100,
    variant: 'success',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Warning: Story = {
  args: {
    value: 45,
    variant: 'warning',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Error: Story = {
  args: {
    value: 30,
    variant: 'error',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

// Size Stories
export const Small: Story = {
  args: {
    value: 65,
    size: 'sm',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Medium: Story = {
  args: {
    value: 65,
    size: 'md',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Large: Story = {
  args: {
    value: 65,
    size: 'lg',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const Animated: Story = {
  args: {
    value: 50,
    animated: true,
    showLabel: true,
    label: 'Loading...',
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const MixedVariants: Story = {
  args: {
    value: 75,
    variant: 'warning',
    indicatorVariant: 'success',
    showLabel: true,
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

// Animated Progress Demo
export const AnimatedDemo: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 50);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="w-96 space-y-6">
        <div>
          <Text className="mb-2">Auto-incrementing progress:</Text>
          <Progress value={progress} showLabel labelPosition="right" />
        </div>
      </div>
    );
  },
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <ThemeSection
      title="Progress Bar Variants"
      description="Progress bars provide visual feedback for ongoing operations. Use different variants to indicate status and urgency."
    >
      <div className="flex flex-col gap-8">
        {/* Variants */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Variants</h3>
          <div className="space-y-4">
            <div>
              <Text as="span" size="sm" color="muted" className="mb-2 block">Default</Text>
              <Progress value={65} showLabel labelPosition="right" />
            </div>
            <div>
              <Text as="span" size="sm" color="muted" className="mb-2 block">Success (100%)</Text>
              <Progress value={100} variant="success" showLabel labelPosition="right" />
            </div>
            <div>
              <Text as="span" size="sm" color="muted" className="mb-2 block">Warning (45%)</Text>
              <Progress value={45} variant="warning" showLabel labelPosition="right" />
            </div>
            <div>
              <Text as="span" size="sm" color="muted" className="mb-2 block">Error (30%)</Text>
              <Progress value={30} variant="error" showLabel labelPosition="right" />
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Sizes</h3>
          <div className="space-y-4">
            <div>
              <Text as="span" size="sm" color="muted" className="mb-2 block">Small</Text>
              <Progress value={65} size="sm" showLabel labelPosition="right" />
            </div>
            <div>
              <Text as="span" size="sm" color="muted" className="mb-2 block">Medium (default)</Text>
              <Progress value={65} size="md" showLabel labelPosition="right" />
            </div>
            <div>
              <Text as="span" size="sm" color="muted" className="mb-2 block">Large</Text>
              <Progress value={65} size="lg" showLabel labelPosition="right" />
            </div>
          </div>
        </div>

        {/* Label Positions */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Label Positions</h3>
          <div className="space-y-6">
            <div>
              <Text as="span" size="sm" color="muted" className="mb-2 block">Top</Text>
              <Progress value={75} showLabel labelPosition="top" />
            </div>
            <div>
              <Text as="span" size="sm" color="muted" className="mb-2 block">Right</Text>
              <Progress value={60} showLabel labelPosition="right" />
            </div>
            <div>
              <Text as="span" size="sm" color="muted" className="mb-2 block">Bottom</Text>
              <Progress value={80} showLabel labelPosition="bottom" />
            </div>
          </div>
        </div>

        {/* Custom Labels */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Custom Labels</h3>
          <div className="space-y-4">
            <div>
              <Progress value={50} showLabel label="Uploading files..." labelPosition="top" />
            </div>
            <div>
              <Progress value={75} showLabel label="Processing 3/4 tasks" labelPosition="right" />
            </div>
          </div>
        </div>

        {/* Animated */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Animated (Indeterminate)</h3>
          <div className="space-y-4">
            <Progress value={50} animated showLabel label="Loading..." />
          </div>
        </div>

        {/* Mixed Variants */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Mixed Variants</h3>
          <div className="space-y-4">
            <div>
              <Text as="span" size="sm" color="muted" className="mb-2 block">
                Warning background, Success indicator
              </Text>
              <Progress
                value={75}
                variant="warning"
                indicatorVariant="success"
                showLabel
                labelPosition="right"
              />
            </div>
          </div>
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

// Real-world Examples
export const RealWorldExamples: Story = {
  render: () => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [taskProgress, setTaskProgress] = useState(0);

    useEffect(() => {
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      }, 100);

      const taskInterval = setInterval(() => {
        setTaskProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 150);

      return () => {
        clearInterval(uploadInterval);
        clearInterval(taskInterval);
      };
    }, []);

    return (
      <ThemeSection
        title="Real-world Examples"
        description="Common use cases for progress bars in applications."
      >
        <div className="space-y-8">
          {/* File Upload */}
          <div className="p-6 bg-[var(--color-background-secondary)] rounded-lg">
            <h3 className="text-lg font-semibold mb-4">File Upload</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Text>audio-file.mp3</Text>
                <Text color="muted">2.5 MB</Text>
              </div>
              <Progress value={uploadProgress} showLabel labelPosition="right" />
            </div>
          </div>

          {/* Multi-step Form */}
          <div className="p-6 bg-[var(--color-background-secondary)] rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Multi-step Form</h3>
            <Progress
              value={(2 / 5) * 100}
              showLabel
              label="Step 2 of 5"
              labelPosition="top"
            />
          </div>

          {/* Task Processing */}
          <div className="p-6 bg-[var(--color-background-secondary)] rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Task Processing</h3>
            <Progress
              value={taskProgress}
              showLabel
              label={`${Math.floor((taskProgress / 100) * 10)}/10 tasks complete`}
              size="lg"
            />
          </div>

          {/* Download with Status */}
          <div className="p-6 bg-[var(--color-background-secondary)] rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Download Status</h3>
            <div className="space-y-4">
              <div>
                <Text size="sm" color="muted" className="mb-2">In Progress</Text>
                <Progress value={65} showLabel labelPosition="bottom" />
              </div>
              <div>
                <Text size="sm" color="muted" className="mb-2">Complete</Text>
                <Progress value={100} variant="success" showLabel labelPosition="bottom" />
              </div>
              <div>
                <Text size="sm" color="muted" className="mb-2">Failed</Text>
                <Progress
                  value={30}
                  variant="error"
                  showLabel
                  label="Download failed"
                  labelPosition="bottom"
                />
              </div>
            </div>
          </div>
        </div>
      </ThemeSection>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
