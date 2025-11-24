import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, Button } from '../../src/components';

const meta = {
  title: '3. Feedback/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
      description: 'The side of the trigger to display the tooltip',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'The alignment of the tooltip',
    },
    delayDuration: {
      control: 'number',
      description: 'Delay in ms before showing the tooltip',
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'This is a helpful tooltip',
    children: <Button>Hover me</Button>,
  },
};

export const Top: Story = {
  args: {
    content: 'Tooltip on top',
    side: 'top',
    children: <Button>Top</Button>,
  },
};

export const Right: Story = {
  args: {
    content: 'Tooltip on right',
    side: 'right',
    children: <Button>Right</Button>,
  },
};

export const Bottom: Story = {
  args: {
    content: 'Tooltip on bottom',
    side: 'bottom',
    children: <Button>Bottom</Button>,
  },
};

export const Left: Story = {
  args: {
    content: 'Tooltip on left',
    side: 'left',
    children: <Button>Left</Button>,
  },
};

export const RichContent: Story = {
  args: {
    content: (
      <div className="space-y-2">
        <div className="text-lg font-semibold">Health Check</div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className="text-emerald-400">Success</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Time:</span>
            <span>12:34 PM</span>
          </div>
        </div>
      </div>
    ),
    side: 'top',
    contentClassName: 'min-w-[240px]',
    children: (
      <div className="w-2 h-8 rounded bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer" />
    ),
  },
};

export const LongContent: Story = {
  args: {
    content: 'This is a longer tooltip message that demonstrates how the tooltip handles multi-line content with automatic wrapping.',
    side: 'top',
    contentClassName: 'max-w-[200px]',
    children: <Button variant="secondary">Hover for long text</Button>,
  },
};

export const QuickDelay: Story = {
  args: {
    content: 'Shows immediately (0ms delay)',
    delayDuration: 0,
    children: <Button variant="outline">Quick tooltip</Button>,
  },
};

export const LongDelay: Story = {
  args: {
    content: 'Shows after 1 second',
    delayDuration: 1000,
    children: <Button variant="outline">Slow tooltip</Button>,
  },
};

export const AllSides: Story = {
  render: () => (
    <div className="flex gap-8 items-center justify-center p-16">
      <Tooltip content="Left tooltip" side="left">
        <Button>Left</Button>
      </Tooltip>

      <div className="flex flex-col gap-8">
        <Tooltip content="Top tooltip" side="top">
          <Button>Top</Button>
        </Tooltip>
        <Tooltip content="Bottom tooltip" side="bottom">
          <Button>Bottom</Button>
        </Tooltip>
      </div>

      <Tooltip content="Right tooltip" side="right">
        <Button>Right</Button>
      </Tooltip>
    </div>
  ),
};

export const InteractiveElements: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Tooltip content="Click to submit">
        <Button variant="gradient">Submit</Button>
      </Tooltip>

      <Tooltip content="Delete this item">
        <Button variant="outline">Delete</Button>
      </Tooltip>

      <Tooltip content="View more options">
        <button className="p-2 rounded hover:bg-gray-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </Tooltip>
    </div>
  ),
};
