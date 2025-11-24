import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../src/components/ui/primitives/card';
import Button from '../../src/components/ui/primitives/button';
import { ThemeSection } from '../components/ThemeSection';

const meta: Meta<typeof Card> = {
  title: '4. Display/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'glass', 'plain', 'gradient-border'],
      description: 'Card visual variant',
    },
    gradient: {
      control: 'boolean',
      description: 'Add gradient glow effect (not applicable to gradient-border variant)',
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

export const GlassVariant: Story = {
  render: () => (
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Glass Card</CardTitle>
        <CardDescription>Semi-transparent background (perfect for admin sections)</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-[var(--color-primary)]">
          This variant has a semi-transparent background and softer borders,
          making it ideal for layered interfaces and admin panels.
        </p>
      </CardContent>
    </Card>
  ),
};

export const PlainVariant: Story = {
  render: () => (
    <Card variant="plain">
      <CardHeader>
        <CardTitle>Plain Card</CardTitle>
        <CardDescription>Solid background without border</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-[var(--color-primary)]">
          This variant has a solid background without a border,
          perfect for simple content containers.
        </p>
      </CardContent>
    </Card>
  ),
};

export const GradientBorderVariant: Story = {
  render: () => (
    <Card variant="gradient-border">
      <CardHeader>
        <CardTitle>Gradient Border Card</CardTitle>
        <CardDescription>Solid background with gradient border</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-[var(--color-primary)]">
          This variant features a vibrant gradient border (cyan to yellow)
          with a solid background. Perfect for highlighting important content!
        </p>
      </CardContent>
    </Card>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <ThemeSection
      title="Card Variants"
      description="All available card variants with and without gradient"
    >
      {/* Background pattern to showcase glass effect */}
      <div
        className="p-6 rounded-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(64, 226, 226, 0.1) 0%, rgba(226, 226, 64, 0.1) 100%)',
          backgroundImage: `
            linear-gradient(135deg, rgba(64, 226, 226, 0.1) 0%, rgba(226, 226, 64, 0.1) 100%),
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)
          `
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Default variant */}
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default</CardTitle>
              <CardDescription>Solid with border & shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-primary)] text-sm">
                Standard card with full border and strong shadow.
              </p>
            </CardContent>
          </Card>

          <Card variant="default" gradient>
            <CardHeader>
              <CardTitle>Default + Gradient</CardTitle>
              <CardDescription>With gradient border effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-primary)] text-sm">
                Hover to see the gradient effect.
              </p>
            </CardContent>
          </Card>

          {/* Glass variant */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Glass</CardTitle>
              <CardDescription>Semi-transparent + blur</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-primary)] text-sm">
                Semi-transparent with backdrop blur. Notice the background shows through!
              </p>
            </CardContent>
          </Card>

          <Card variant="glass" gradient>
            <CardHeader>
              <CardTitle>Glass + Gradient</CardTitle>
              <CardDescription>Semi-transparent with gradient</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-primary)] text-sm">
                Combines glass effect with gradient.
              </p>
            </CardContent>
          </Card>

          {/* Plain variant */}
          <Card variant="plain">
            <CardHeader>
              <CardTitle>Plain</CardTitle>
              <CardDescription>Solid, subtle shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-primary)] text-sm">
                Solid background with subtle shadow, no border.
              </p>
            </CardContent>
          </Card>

          <Card variant="plain" gradient>
            <CardHeader>
              <CardTitle>Plain + Gradient Glow</CardTitle>
              <CardDescription>Solid with gradient glow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-primary)] text-sm">
                Simple card with gradient glow effect.
              </p>
            </CardContent>
          </Card>

          {/* Gradient Border variant */}
          <Card variant="gradient-border">
            <CardHeader>
              <CardTitle>Gradient Border</CardTitle>
              <CardDescription>Solid with gradient border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-primary)] text-sm">
                Vibrant gradient border, solid background.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ThemeSection>
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

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Admin Section</CardTitle>
            <CardDescription>Using glass variant for forms</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-primary)] text-sm mb-4">
              Perfect for admin panels and form containers.
            </p>
            <Button variant="secondary" size="md">
              Submit Form
            </Button>
          </CardContent>
        </Card>

        <Card variant="plain">
          <CardHeader>
            <CardTitle>Simple Container</CardTitle>
            <CardDescription>Using plain variant</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-primary)] text-sm mb-4">
              Clean minimal card for simple content.
            </p>
            <Button variant="default" size="full">
              Get Started
            </Button>
          </CardContent>
        </Card>

        <Card variant="gradient-border">
          <CardHeader>
            <CardTitle>Featured Content</CardTitle>
            <CardDescription>Using gradient-border variant</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-primary)] text-sm mb-4">
              Stand out with a vibrant gradient border!
            </p>
            <Button variant="secondary" size="full">
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>
    </ThemeSection>
  ),
};
