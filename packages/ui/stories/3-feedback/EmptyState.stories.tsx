import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from '../../src/components';
import { Button } from '../../src/components';

const meta = {
  title: '3. Feedback/Empty State',
  component: EmptyState,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the empty state',
    },
    icon: {
      control: 'text',
      description: 'Icon to display (emoji or React component)',
    },
    title: {
      control: 'text',
      description: 'Title text',
    },
    description: {
      control: 'text',
      description: 'Description text or React component',
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'No items yet',
    description: 'Get started by creating your first item',
  },
};

export const WithIcon: Story = {
  args: {
    icon: '📭',
    title: 'No messages',
    description: 'You don\'t have any messages yet',
  },
};

export const WithAction: Story = {
  args: {
    icon: '🎵',
    title: 'No submissions yet',
    description: 'Submit your first cover to get started',
    action: <Button variant="secondary">Submit Cover</Button>,
  },
};

export const SimpleText: Story = {
  args: {
    children: <p className="text-sm text-secondary">No reflections yet. Create your first one!</p>,
  },
};

export const SmallSize: Story = {
  args: {
    size: 'sm',
    icon: '📝',
    title: 'No notes',
    description: 'Start taking notes',
  },
};

export const LargeSize: Story = {
  args: {
    size: 'lg',
    icon: '🎉',
    title: 'Welcome!',
    description: 'You\'re all set to begin your journey',
    action: <Button variant="gradient" size="lg">Get Started</Button>,
  },
};

export const NoNotifications: Story = {
  name: 'No Notifications (Real World Example)',
  args: {
    icon: '🔔',
    title: 'All caught up!',
    description: 'No new notifications',
  },
};

export const NoSubmissions: Story = {
  name: 'No Submissions (Real World Example)',
  args: {
    icon: '🎸',
    title: 'No submissions yet',
    description: 'Be the first to submit a cover for this round',
    action: <Button variant="secondary">Submit Now</Button>,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Small</h3>
        <EmptyState
          size="sm"
          icon="📭"
          title="Empty inbox"
          description="No messages"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Medium (Default)</h3>
        <EmptyState
          icon="🎵"
          title="No submissions yet"
          description="Submit your first cover to get started"
          action={<Button variant="secondary">Submit Cover</Button>}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Large</h3>
        <EmptyState
          size="lg"
          icon="🎉"
          title="Welcome to EPTSS!"
          description="Your journey begins here"
          action={<Button variant="gradient" size="lg">Get Started</Button>}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-primary">Simple Text Only</h3>
        <EmptyState>
          <p className="text-sm text-secondary">No items to display</p>
        </EmptyState>
      </div>
    </div>
  ),
};
