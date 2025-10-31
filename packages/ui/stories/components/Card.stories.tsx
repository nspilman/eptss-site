import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../src/components/ui/primitives/card';
import Button from '../../src/components/ui/primitives/button';
import { ThemeSection } from './ThemeSection';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    gradient: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>This is a card description</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-[var(--color-primary)]">Card content goes here.</p>
      </CardContent>
    </Card>
  ),
};

export const WithGradient: Story = {
  render: () => (
    <Card gradient>
      <CardHeader>
        <CardTitle>Card with Gradient</CardTitle>
        <CardDescription>This card has a gradient background effect</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-[var(--color-primary)]">The gradient appears on hover.</p>
      </CardContent>
    </Card>
  ),
};

export const WithButton: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Action Card</CardTitle>
        <CardDescription>A card with a call-to-action button</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-[var(--color-primary)] mb-4">
          This card includes interactive elements.
        </p>
        <Button variant="secondary" size="md">
          Take Action
        </Button>
      </CardContent>
    </Card>
  ),
};

export const Examples: Story = {
  render: () => (
    <ThemeSection
      title="Card Examples"
      description="Different card layouts and use cases"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Card</CardTitle>
            <CardDescription>Simple card with title and description</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-primary)] text-sm">
              This is a basic card component that can be used for various content types.
            </p>
          </CardContent>
        </Card>

        <Card gradient>
          <CardHeader>
            <CardTitle>Gradient Card</CardTitle>
            <CardDescription>Card with hover gradient effect</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-primary)] text-sm">
              Hover over this card to see the gradient effect.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Card</CardTitle>
            <CardDescription>Highlighting a feature or benefit</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[var(--color-primary)]">
              <li>✓ Feature one</li>
              <li>✓ Feature two</li>
              <li>✓ Feature three</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CTA Card</CardTitle>
            <CardDescription>Card with a call to action</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-primary)] text-sm mb-4">
              Ready to get started? Click the button below.
            </p>
            <Button variant="default" size="full">
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    </ThemeSection>
  ),
};
