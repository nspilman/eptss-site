import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarImage, AvatarFallback } from '../../src/components/ui/avatar';
import { ThemeSection } from '../components/ThemeSection';

import { Text } from "@eptss/ui";
const meta: Meta<typeof Avatar> = {
  title: '4. Display/Avatar',
  component: Avatar,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/broken-image.jpg" alt="Avatar" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <ThemeSection
      title="Avatar Sizes"
      description="Avatars in different sizes"
    >
      <div className="flex items-end gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src="https://github.com/shadcn.png" alt="Small" />
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>

        <Avatar className="h-12 w-12">
          <AvatarImage src="https://github.com/shadcn.png" alt="Medium" />
          <AvatarFallback>MD</AvatarFallback>
        </Avatar>

        <Avatar className="h-16 w-16">
          <AvatarImage src="https://github.com/shadcn.png" alt="Large" />
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>

        <Avatar className="h-24 w-24">
          <AvatarImage src="https://github.com/shadcn.png" alt="Extra Large" />
          <AvatarFallback>XL</AvatarFallback>
        </Avatar>
      </div>
    </ThemeSection>
  ),
};

export const Examples: Story = {
  render: () => (
    <ThemeSection
      title="Avatar Examples"
      description="Common avatar use cases"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-3 text-[var(--color-primary)]">With Images</h3>
          <div className="flex gap-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://github.com/vercel.png" alt="User 2" />
              <AvatarFallback>U2</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src="https://github.com/nextjs.png" alt="User 3" />
              <AvatarFallback>U3</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3 text-[var(--color-primary)]">With Fallbacks</h3>
          <div className="flex gap-2">
            <Avatar>
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>CD</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>EF</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3 text-[var(--color-primary)]">User List</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <Text size="sm" weight="medium" className="text-[var(--color-primary)]">John Doe</Text>
                <Text size="xs" className="text-[var(--color-secondary)]">john@example.com</Text>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              <div>
                <Text size="sm" weight="medium" className="text-[var(--color-primary)]">Sarah Miller</Text>
                <Text size="xs" className="text-[var(--color-secondary)]">sarah@example.com</Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeSection>
  ),
};
