import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { AlertBox } from '../../src/components/ui/primitives/alert-box';
import { ThemeSection } from '../components/ThemeSection';
import { Heart } from 'lucide-react';

const meta: Meta<typeof AlertBox> = {
  title: '3. Feedback/Alert Box',
  component: AlertBox,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0a0a14' },
        { name: 'light', value: '#ffffff' }
      ]
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'warning', 'success', 'error'],
      description: 'The visual style and color of the alert box'
    },
    title: {
      control: 'text',
      description: 'Optional title/heading for the alert'
    },
    icon: {
      control: 'boolean',
      description: 'Show icon (true), hide icon (false), or provide custom icon (React node)'
    },
    children: {
      control: 'text',
      description: 'Alert message content'
    },
  },
  args: {
    variant: 'info',
    title: undefined,
    icon: true,
    children: 'This is an informational message.',
  }
};

export default meta;
type Story = StoryObj<typeof AlertBox>;

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'This is an informational message to provide context or additional details.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Use with caution',
    children: 'These tools perform direct database operations and send real emails. Make sure you understand what each tool does before using it.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success!',
    children: 'Your changes have been saved successfully.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    children: 'Something went wrong. Please try again or contact support.',
  },
};

export const WithoutIcon: Story = {
  args: {
    variant: 'info',
    icon: false,
    children: <><strong>Note:</strong> You can toggle feedback visibility to make it public or private, or delete inappropriate feedback entirely.</>,
  },
};

export const CustomIcon: Story = {
  args: {
    variant: 'info',
    icon: <Heart className="h-5 w-5 text-pink-500" />,
    title: 'Custom Icon',
    children: 'You can provide any custom icon component.',
  },
};

export const SimpleNote: Story = {
  args: {
    variant: 'info',
    icon: false,
    children: (
      <>
        <strong className="font-semibold">Note:</strong> Since signups have closed, you'll join without selecting a song. You can still participate in all other round activities!
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <ThemeSection
      title="Alert Box Variants"
      description="Alert boxes provide color-coded feedback messages. Use info for general notes, warning for caution, success for confirmations, and error for problems."
    >
      <div className="flex flex-col gap-6 w-full max-w-3xl">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Info</h3>
          <AlertBox variant="info">
            This is an informational message to provide context or additional details.
          </AlertBox>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Info with Title</h3>
          <AlertBox variant="info" title="Did you know?">
            You can customize the alert box with a title for more structured messages.
          </AlertBox>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Warning</h3>
          <AlertBox variant="warning" title="Use with caution">
            These tools perform direct database operations and send real emails.
            Make sure you understand what each tool does before using it.
          </AlertBox>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Success</h3>
          <AlertBox variant="success" title="Changes saved">
            Your profile has been updated successfully.
          </AlertBox>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Error</h3>
          <AlertBox variant="error" title="Something went wrong">
            We couldn't process your request. Please try again or contact support if the problem persists.
          </AlertBox>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Without Icon</h3>
          <AlertBox variant="info" icon={false}>
            <strong>Note:</strong> You can toggle feedback visibility to make it public or private,
            or delete inappropriate feedback entirely.
          </AlertBox>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary">Custom Icon</h3>
          <AlertBox variant="info" icon={<Heart className="h-5 w-5 text-pink-500" />} title="We appreciate you">
            Thank you for being part of our community!
          </AlertBox>
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
