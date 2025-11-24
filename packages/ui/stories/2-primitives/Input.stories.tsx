import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import Input from '../../src/components/ui/primitives/input';
import { ThemeSection } from '../components/ThemeSection';

const meta: Meta<typeof Input> = {
  title: '2. Primitives/Input',
  component: Input,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Hello World',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Enter text...',
    error: true,
    defaultValue: 'Invalid input',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <ThemeSection
      title="Input States"
      description="Different states and types of inputs"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-primary)]">
            Default
          </label>
          <Input placeholder="Enter text..." />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-primary)]">
            With Value
          </label>
          <Input defaultValue="Some text" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-primary)]">
            Email
          </label>
          <Input type="email" placeholder="email@example.com" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-primary)]">
            Password
          </label>
          <Input type="password" placeholder="Enter password" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-primary)]">
            Number
          </label>
          <Input type="number" placeholder="0" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-primary)]">
            Error State
          </label>
          <Input error placeholder="Enter text..." defaultValue="Invalid input" />
          <p className="text-xs text-[var(--color-destructive)]">This field has an error</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-gray-400)]">
            Disabled
          </label>
          <Input disabled placeholder="Disabled input" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-primary)]">
            Search
          </label>
          <Input type="search" placeholder="Search..." />
        </div>
      </div>
    </ThemeSection>
  ),
};
