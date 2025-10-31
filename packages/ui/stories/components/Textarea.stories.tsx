import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '../../src/components/ui/primitives/textarea';
import { ThemeSection } from './ThemeSection';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    rows: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your text here...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'This is some text in a textarea.\nIt can span multiple lines.',
  },
};

export const Tall: Story = {
  args: {
    rows: 10,
    placeholder: 'A taller textarea...',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea',
    disabled: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <ThemeSection
      title="Textarea States"
      description="Different states of textareas"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-primary)]">
            Default
          </label>
          <Textarea placeholder="Enter your text here..." />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-primary)]">
            With Value
          </label>
          <Textarea defaultValue="This is some text in a textarea.\nIt can span multiple lines." />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-primary)]">
            Tall Textarea
          </label>
          <Textarea rows={10} placeholder="A taller textarea for more content..." />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-gray-400)]">
            Disabled
          </label>
          <Textarea disabled placeholder="Disabled textarea" />
        </div>
      </div>
    </ThemeSection>
  ),
};
