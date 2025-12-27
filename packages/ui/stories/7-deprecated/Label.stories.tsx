import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Label } from '../../src/components/ui/label';
import Input from '../../src/components/ui/primitives/input';
import { Textarea } from '../../src/components/ui/primitives/textarea';
import { ThemeSection } from '../components/ThemeSection';

import { Text } from "@eptss/ui";
const meta: Meta<typeof Label> = {
  title: '7. Deprecated/Label (Use FormLabel)',
  component: Label,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: 'Label',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="email@example.com" />
    </div>
  ),
};

export const WithTextarea: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea id="description" placeholder="Enter a description..." />
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <ThemeSection
      title="Label Examples"
      description="Labels used with form elements"
    >
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="John Doe" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email-example">Email Address</Label>
          <Input id="email-example" type="email" placeholder="john@example.com" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" placeholder="Tell us about yourself..." rows={4} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" />
          <Text size="xs" className="text-[var(--color-secondary)]">
            Must be at least 8 characters
          </Text>
        </div>
      </div>
    </ThemeSection>
  ),
};
