import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { EqualizerBars } from '../src';
import { ThemeSection } from './components/ThemeSection';
import { Text, Button } from '@eptss/ui';

const meta: Meta<typeof EqualizerBars> = {
  title: 'Media Display/EqualizerBars',
  component: EqualizerBars,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  argTypes: {
    isPlaying: {
      control: 'boolean',
      description: 'Whether the animation is playing',
    },
    barCount: {
      control: { type: 'range', min: 2, max: 8 },
      description: 'Number of bars',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    color: {
      control: 'color',
      description: 'Color of the bars',
    },
  },
  args: {
    isPlaying: true,
    barCount: 4,
    size: 'sm',
    color: 'var(--color-accent-primary)',
  },
};

export default meta;
type Story = StoryObj<typeof EqualizerBars>;

export const Default: Story = {
  render: (args) => (
    <div className="p-8 flex items-center justify-center">
      <EqualizerBars {...args} />
    </div>
  ),
};

export const Playing: Story = {
  args: {
    isPlaying: true,
  },
  render: (args) => (
    <div className="p-8 flex items-center justify-center">
      <EqualizerBars {...args} />
    </div>
  ),
};

export const Paused: Story = {
  args: {
    isPlaying: false,
  },
  render: (args) => (
    <div className="p-8 flex items-center justify-center">
      <EqualizerBars {...args} />
    </div>
  ),
};

export const SmallSize: Story = {
  args: {
    size: 'sm',
  },
  render: (args) => (
    <div className="p-8 flex items-center justify-center">
      <EqualizerBars {...args} />
    </div>
  ),
};

export const MediumSize: Story = {
  args: {
    size: 'md',
  },
  render: (args) => (
    <div className="p-8 flex items-center justify-center">
      <EqualizerBars {...args} />
    </div>
  ),
};

export const LargeSize: Story = {
  args: {
    size: 'lg',
  },
  render: (args) => (
    <div className="p-8 flex items-center justify-center">
      <EqualizerBars {...args} />
    </div>
  ),
};

export const CustomBarCount: Story = {
  args: {
    barCount: 6,
    size: 'lg',
  },
  render: (args) => (
    <div className="p-8 flex items-center justify-center">
      <EqualizerBars {...args} />
    </div>
  ),
};

export const CustomColor: Story = {
  args: {
    color: '#22c55e',
    size: 'lg',
  },
  render: (args) => (
    <div className="p-8 flex items-center justify-center">
      <EqualizerBars {...args} />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [isPlaying, setIsPlaying] = useState(true);

    return (
      <div className="p-8 flex flex-col items-center gap-4">
        <EqualizerBars isPlaying={isPlaying} size="lg" />
        <Button
          variant="default"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Text size="sm" color="muted">
          Click to toggle animation
        </Text>
      </div>
    );
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="p-8 flex items-end gap-8">
      <div className="flex flex-col items-center gap-2">
        <EqualizerBars isPlaying={true} size="sm" />
        <Text size="xs" color="muted">Small</Text>
      </div>
      <div className="flex flex-col items-center gap-2">
        <EqualizerBars isPlaying={true} size="md" />
        <Text size="xs" color="muted">Medium</Text>
      </div>
      <div className="flex flex-col items-center gap-2">
        <EqualizerBars isPlaying={true} size="lg" />
        <Text size="xs" color="muted">Large</Text>
      </div>
    </div>
  ),
};

export const ColorVariations: Story = {
  render: () => (
    <div className="p-8 flex items-end gap-8">
      <div className="flex flex-col items-center gap-2">
        <EqualizerBars isPlaying={true} size="lg" color="var(--color-accent-primary)" />
        <Text size="xs" color="muted">Accent</Text>
      </div>
      <div className="flex flex-col items-center gap-2">
        <EqualizerBars isPlaying={true} size="lg" color="#22c55e" />
        <Text size="xs" color="muted">Green</Text>
      </div>
      <div className="flex flex-col items-center gap-2">
        <EqualizerBars isPlaying={true} size="lg" color="#ef4444" />
        <Text size="xs" color="muted">Red</Text>
      </div>
      <div className="flex flex-col items-center gap-2">
        <EqualizerBars isPlaying={true} size="lg" color="#3b82f6" />
        <Text size="xs" color="muted">Blue</Text>
      </div>
      <div className="flex flex-col items-center gap-2">
        <EqualizerBars isPlaying={true} size="lg" color="#ffffff" />
        <Text size="xs" color="muted">White</Text>
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => {
    const [isPlaying, setIsPlaying] = useState(true);

    return (
      <ThemeSection
        title="Equalizer Bars"
        description="Animated equalizer bars that indicate audio is playing. Supports multiple sizes, colors, and bar counts."
      >
        <div className="space-y-12">
          <div>
            <Text size="sm" weight="medium" className="mb-4">
              Sizes
            </Text>
            <div className="flex items-end gap-8">
              <div className="flex flex-col items-center gap-2">
                <EqualizerBars isPlaying={isPlaying} size="sm" />
                <Text size="xs" color="muted">Small</Text>
              </div>
              <div className="flex flex-col items-center gap-2">
                <EqualizerBars isPlaying={isPlaying} size="md" />
                <Text size="xs" color="muted">Medium</Text>
              </div>
              <div className="flex flex-col items-center gap-2">
                <EqualizerBars isPlaying={isPlaying} size="lg" />
                <Text size="xs" color="muted">Large</Text>
              </div>
            </div>
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-4">
              Bar Counts
            </Text>
            <div className="flex items-end gap-8">
              {[2, 3, 4, 5, 6].map((count) => (
                <div key={count} className="flex flex-col items-center gap-2">
                  <EqualizerBars isPlaying={isPlaying} size="md" barCount={count} />
                  <Text size="xs" color="muted">{count} bars</Text>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-4">
              Colors
            </Text>
            <div className="flex items-end gap-8">
              <div className="flex flex-col items-center gap-2">
                <EqualizerBars isPlaying={isPlaying} size="md" color="var(--color-accent-primary)" />
                <Text size="xs" color="muted">Accent</Text>
              </div>
              <div className="flex flex-col items-center gap-2">
                <EqualizerBars isPlaying={isPlaying} size="md" color="#22c55e" />
                <Text size="xs" color="muted">Green</Text>
              </div>
              <div className="flex flex-col items-center gap-2">
                <EqualizerBars isPlaying={isPlaying} size="md" color="#ef4444" />
                <Text size="xs" color="muted">Red</Text>
              </div>
              <div className="flex flex-col items-center gap-2">
                <EqualizerBars isPlaying={isPlaying} size="md" color="#3b82f6" />
                <Text size="xs" color="muted">Blue</Text>
              </div>
            </div>
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-4">
              States
            </Text>
            <div className="flex items-end gap-8">
              <div className="flex flex-col items-center gap-2">
                <EqualizerBars isPlaying={true} size="md" />
                <Text size="xs" color="muted">Playing</Text>
              </div>
              <div className="flex flex-col items-center gap-2">
                <EqualizerBars isPlaying={false} size="md" />
                <Text size="xs" color="muted">Paused</Text>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? 'Pause All' : 'Play All'}
            </Button>
            <Text size="sm" color="muted">
              Toggle all animations
            </Text>
          </div>
        </div>
      </ThemeSection>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
