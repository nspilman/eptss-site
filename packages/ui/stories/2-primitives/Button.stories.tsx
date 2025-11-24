import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Button from '../../src/components/ui/primitives/button';
import { ThemeSection } from '../components/ThemeSection';

const meta: Meta<typeof Button> = {
  title: '2. Primitives/Button',
  component: Button,
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
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'destructive', 'ghost', 'link', 'gradient', 'action', 'danger'],
      description: 'The visual style of the button'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'full', 'icon'],
      description: 'The size of the button'
    },
    children: {
      control: 'text',
      description: 'Button content'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled'
    }
  },
  args: {
    children: 'Button Text',
    variant: 'default',
    size: 'md',
    disabled: false
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
  },
};

export const Gradient: Story = {
  args: {
    variant: 'gradient',
    children: 'Post Comment',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const FullWidth: Story = {
  args: {
    size: 'full',
  },
  parameters: {
    layout: 'padded',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <ThemeSection 
      title="Button Variants" 
      description="Buttons are used to trigger actions or events. Different variants are available for different contexts."
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2 items-center">
            <Button variant="default">Default</Button>
            <span className="text-xs text-primary mt-1">Default</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Button variant="secondary">Secondary</Button>
            <span className="text-xs text-primary mt-1">Secondary</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Button variant="outline">Outline</Button>
            <span className="text-xs text-primary mt-1">Outline</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Button variant="destructive">Destructive</Button>
            <span className="text-xs text-primary mt-1">Destructive</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Button variant="ghost">Ghost</Button>
            <span className="text-xs text-primary mt-1">Ghost</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Button variant="link">Link</Button>
            <span className="text-xs text-primary mt-1">Link</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Button variant="gradient">Gradient</Button>
            <span className="text-xs text-primary mt-1">Gradient</span>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Button Sizes</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-2 items-center">
              <Button size="sm">Small</Button>
              <span className="text-xs text-primary mt-1">Small</span>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <Button size="md">Medium</Button>
              <span className="text-xs text-primary mt-1">Medium</span>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <Button size="lg">Large</Button>
              <span className="text-xs text-primary mt-1">Large</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Full Width Button</h3>
          <Button size="full">Full Width Button</Button>
        </div>
        
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Disabled State</h3>
          <div className="flex flex-wrap gap-4">
            <Button disabled>Disabled Button</Button>
            <Button variant="secondary" disabled>Disabled Secondary</Button>
            <Button variant="outline" disabled>Disabled Outline</Button>
          </div>
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
