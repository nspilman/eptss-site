import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { GridLayout, GridItem } from '../../src/components/ui/primitives/grid-layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../src/components/ui/primitives/card';
import Button from '../../src/components/ui/primitives/button';
import { ThemeSection } from '../components/ThemeSection';

import { Text } from "@eptss/ui";
const meta: Meta<typeof GridLayout> = {
  title: '4. Display/GridLayout',
  component: GridLayout,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    cols: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      description: 'Number of columns for desktop layout',
    },
    template: {
      control: 'text',
      description: 'Custom grid-template-columns value (e.g., "2fr 1fr")',
    },
    mobileCols: {
      control: 'select',
      options: [1, 2, 3, 4],
      description: 'Number of columns for mobile layout',
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Gap between grid items',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Vertical alignment of items',
    },
    breakpoint: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Breakpoint for mobile to desktop transition',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GridLayout>;

// Helper component for demo boxes
const DemoBox = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`bg-[var(--color-background-secondary)] border-2 border-[var(--color-primary)] rounded-lg p-4 min-h-[100px] flex items-center justify-center text-[var(--color-primary)] font-semibold ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const TwoColumnEqual: Story = {
  render: () => (
    <GridLayout cols={2} gap="md">
      <GridItem>
        <DemoBox>Column 1</DemoBox>
      </GridItem>
      <GridItem>
        <DemoBox>Column 2</DemoBox>
      </GridItem>
    </GridLayout>
  ),
};

export const ThreeColumnEqual: Story = {
  render: () => (
    <GridLayout cols={3} gap="md">
      <GridItem>
        <DemoBox>Column 1</DemoBox>
      </GridItem>
      <GridItem>
        <DemoBox>Column 2</DemoBox>
      </GridItem>
      <GridItem>
        <DemoBox>Column 3</DemoBox>
      </GridItem>
    </GridLayout>
  ),
};

export const FractionalLayout: Story = {
  render: () => (
    <GridLayout template="2fr 1fr" gap="md">
      <GridItem>
        <DemoBox className="min-h-[200px]">
          Main Content (2/3 width)
        </DemoBox>
      </GridItem>
      <GridItem>
        <DemoBox className="min-h-[200px]">
          Sidebar (1/3 width)
        </DemoBox>
      </GridItem>
    </GridLayout>
  ),
};

export const FullWidthHeader: Story = {
  render: () => (
    <GridLayout template="2fr 1fr" gap="lg">
      <GridItem colSpan="full">
        <DemoBox>Full Width Header</DemoBox>
      </GridItem>
      <GridItem>
        <DemoBox className="min-h-[150px]">Main Content</DemoBox>
      </GridItem>
      <GridItem>
        <DemoBox className="min-h-[150px]">Sidebar</DemoBox>
      </GridItem>
    </GridLayout>
  ),
};

export const ComplexSpans: Story = {
  render: () => (
    <GridLayout cols={4} gap="md">
      <GridItem colSpan={4}>
        <DemoBox>Full Width Header (Span 4)</DemoBox>
      </GridItem>
      <GridItem colSpan={3} rowSpan={2}>
        <DemoBox className="min-h-[250px]">
          Large Content Area<br />
          (3 cols × 2 rows)
        </DemoBox>
      </GridItem>
      <GridItem>
        <DemoBox>Sidebar 1</DemoBox>
      </GridItem>
      <GridItem>
        <DemoBox>Sidebar 2</DemoBox>
      </GridItem>
      <GridItem colSpan={2}>
        <DemoBox>Footer Left (Span 2)</DemoBox>
      </GridItem>
      <GridItem colSpan={2}>
        <DemoBox>Footer Right (Span 2)</DemoBox>
      </GridItem>
    </GridLayout>
  ),
};

export const DifferentGaps: Story = {
  render: () => (
    <ThemeSection
      title="Gap Sizes"
      description="Compare different gap sizes between grid items"
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-white)]">None (gap-0)</h3>
          <GridLayout cols={3} gap="none">
            <GridItem><DemoBox>Item 1</DemoBox></GridItem>
            <GridItem><DemoBox>Item 2</DemoBox></GridItem>
            <GridItem><DemoBox>Item 3</DemoBox></GridItem>
          </GridLayout>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-white)]">Small (gap-3)</h3>
          <GridLayout cols={3} gap="sm">
            <GridItem><DemoBox>Item 1</DemoBox></GridItem>
            <GridItem><DemoBox>Item 2</DemoBox></GridItem>
            <GridItem><DemoBox>Item 3</DemoBox></GridItem>
          </GridLayout>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-white)]">Medium (gap-6)</h3>
          <GridLayout cols={3} gap="md">
            <GridItem><DemoBox>Item 1</DemoBox></GridItem>
            <GridItem><DemoBox>Item 2</DemoBox></GridItem>
            <GridItem><DemoBox>Item 3</DemoBox></GridItem>
          </GridLayout>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-white)]">Large (gap-8)</h3>
          <GridLayout cols={3} gap="lg">
            <GridItem><DemoBox>Item 1</DemoBox></GridItem>
            <GridItem><DemoBox>Item 2</DemoBox></GridItem>
            <GridItem><DemoBox>Item 3</DemoBox></GridItem>
          </GridLayout>
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const DashboardExample: Story = {
  render: () => (
    <GridLayout template="2fr 1fr" gap="lg">
      {/* Full width header panel */}
      <GridItem colSpan="full">
        <Card variant="gradient-border">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--color-primary)] mb-4">
              Set up your display name and bio to get started.
            </p>
            <Button variant="gradient" size="md">
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </GridItem>

      {/* Main content area - 2/3 width */}
      <GridItem>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Round 42: Cosmic Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-primary)] mb-4">
                This week's song takes you on an ethereal journey through space and time.
                Share your reflections below!
              </p>
              <div className="flex gap-3">
                <Button variant="gradient" size="md">
                  Submit Reflection
                </Button>
                <Button variant="secondary" size="md">
                  Listen Now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Reflections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-primary)]">
                You haven't submitted a reflection for this round yet.
              </p>
            </CardContent>
          </Card>
        </div>
      </GridItem>

      {/* Sidebar - 1/3 width */}
      <GridItem>
        <div className="space-y-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Round Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-[var(--color-primary)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20" />
                  <span>Alex M.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20" />
                  <span>Jordan P.</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20" />
                  <span>Sam K.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-[var(--color-primary)]">
                <div className="flex justify-between">
                  <span>Rounds Participated:</span>
                  <Text as="span" weight="bold">12</Text>
                </div>
                <div className="flex justify-between">
                  <span>Current Streak:</span>
                  <Text as="span" weight="bold">3 weeks</Text>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </GridItem>

      {/* Full width footer panels */}
      <GridItem colSpan="full">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Community Reflections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-primary)]">
                See what others are saying about this week's song...
              </p>
            </CardContent>
          </Card>

          <Card variant="plain">
            <CardHeader>
              <CardTitle>Invite Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[var(--color-primary)] mb-4">
                Share EPTSS with your friends and grow the community!
              </p>
              <Button variant="secondary" size="md">
                Get Invite Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </GridItem>
    </GridLayout>
  ),
};

export const ResponsiveBehavior: Story = {
  render: () => (
    <ThemeSection
      title="Responsive Behavior"
      description="Resize your browser to see how the grid adapts. On desktop (≥768px) it shows a 3-column layout, on mobile it stacks to 1 column."
    >
      <GridLayout cols={3} mobileCols={1} gap="md" breakpoint="md">
        <GridItem colSpan={3} mobileColSpan="full">
          <DemoBox>
            Full Width on All Devices<br />
            <Text as="span" size="sm" weight="normal">(colSpan=3, mobileColSpan="full")</Text>
          </DemoBox>
        </GridItem>
        <GridItem colSpan={2} mobileColSpan="full">
          <DemoBox className="min-h-[150px]">
            2 Columns on Desktop<br />
            Full Width on Mobile<br />
            <Text as="span" size="sm" weight="normal">(colSpan=2, mobileColSpan="full")</Text>
          </DemoBox>
        </GridItem>
        <GridItem colSpan={1} mobileColSpan="full">
          <DemoBox className="min-h-[150px]">
            1 Column on Desktop<br />
            Full Width on Mobile<br />
            <Text as="span" size="sm" weight="normal">(colSpan=1, mobileColSpan="full")</Text>
          </DemoBox>
        </GridItem>
        <GridItem>
          <DemoBox>Column 1</DemoBox>
        </GridItem>
        <GridItem>
          <DemoBox>Column 2</DemoBox>
        </GridItem>
        <GridItem>
          <DemoBox>Column 3</DemoBox>
        </GridItem>
      </GridLayout>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const VerticalAlignment: Story = {
  render: () => (
    <ThemeSection
      title="Vertical Alignment"
      description="Control how items align vertically within the grid"
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-white)]">Align: Start (Default)</h3>
          <GridLayout cols={3} gap="md" align="start">
            <GridItem>
              <DemoBox className="min-h-[100px]">Short</DemoBox>
            </GridItem>
            <GridItem>
              <DemoBox className="min-h-[200px]">Tall Item</DemoBox>
            </GridItem>
            <GridItem>
              <DemoBox className="min-h-[150px]">Medium</DemoBox>
            </GridItem>
          </GridLayout>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-white)]">Align: Center</h3>
          <GridLayout cols={3} gap="md" align="center">
            <GridItem>
              <DemoBox className="min-h-[100px]">Short</DemoBox>
            </GridItem>
            <GridItem>
              <DemoBox className="min-h-[200px]">Tall Item</DemoBox>
            </GridItem>
            <GridItem>
              <DemoBox className="min-h-[150px]">Medium</DemoBox>
            </GridItem>
          </GridLayout>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-white)]">Align: Stretch</h3>
          <GridLayout cols={3} gap="md" align="stretch">
            <GridItem>
              <DemoBox className="h-full">Stretched to Match Tallest</DemoBox>
            </GridItem>
            <GridItem>
              <DemoBox className="min-h-[200px] h-full">Tall Item</DemoBox>
            </GridItem>
            <GridItem>
              <DemoBox className="h-full">Stretched to Match Tallest</DemoBox>
            </GridItem>
          </GridLayout>
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const AsymmetricLayouts: Story = {
  render: () => (
    <ThemeSection
      title="Asymmetric Layouts"
      description="Create complex asymmetric layouts with custom fractional widths"
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-white)]">1fr 2fr (Sidebar Left)</h3>
          <GridLayout template="1fr 2fr" gap="md">
            <GridItem>
              <DemoBox className="min-h-[150px]">Narrow Sidebar (1fr)</DemoBox>
            </GridItem>
            <GridItem>
              <DemoBox className="min-h-[150px]">Wide Content (2fr)</DemoBox>
            </GridItem>
          </GridLayout>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-white)]">2fr 1fr (Sidebar Right)</h3>
          <GridLayout template="2fr 1fr" gap="md">
            <GridItem>
              <DemoBox className="min-h-[150px]">Wide Content (2fr)</DemoBox>
            </GridItem>
            <GridItem>
              <DemoBox className="min-h-[150px]">Narrow Sidebar (1fr)</DemoBox>
            </GridItem>
          </GridLayout>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-white)]">3fr 1fr 1fr (Main + 2 Sidebars)</h3>
          <GridLayout template="3fr 1fr 1fr" gap="md">
            <GridItem>
              <DemoBox className="min-h-[150px]">Main Content (3fr)</DemoBox>
            </GridItem>
            <GridItem>
              <DemoBox className="min-h-[150px]">Sidebar 1 (1fr)</DemoBox>
            </GridItem>
            <GridItem>
              <DemoBox className="min-h-[150px]">Sidebar 2 (1fr)</DemoBox>
            </GridItem>
          </GridLayout>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-[var(--color-white)]">1fr 3fr 1fr (Centered Main)</h3>
          <GridLayout template="1fr 3fr 1fr" gap="md">
            <GridItem>
              <DemoBox className="min-h-[150px]">Left (1fr)</DemoBox>
            </GridItem>
            <GridItem>
              <DemoBox className="min-h-[150px]">Main Content (3fr)</DemoBox>
            </GridItem>
            <GridItem>
              <DemoBox className="min-h-[150px]">Right (1fr)</DemoBox>
            </GridItem>
          </GridLayout>
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const RealWorldExamples: Story = {
  render: () => (
    <ThemeSection
      title="Real World Examples"
      description="Common layout patterns you might use in your application"
    >
      <div className="space-y-12">
        {/* Photo Gallery */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-[var(--color-white)]">Photo Gallery (4 Columns)</h3>
          <GridLayout cols={4} gap="sm">
            {Array.from({ length: 8 }).map((_, i) => (
              <GridItem key={i}>
                <div className="aspect-square bg-gradient-to-br from-cyan-500/20 to-yellow-500/20 rounded-lg flex items-center justify-center text-[var(--color-primary)]">
                  Photo {i + 1}
                </div>
              </GridItem>
            ))}
          </GridLayout>
        </div>

        {/* Product Cards */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-[var(--color-white)]">Product Cards (3 Columns)</h3>
          <GridLayout cols={3} gap="lg">
            {Array.from({ length: 3 }).map((_, i) => (
              <GridItem key={i}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="aspect-square bg-gradient-to-br from-cyan-500/10 to-yellow-500/10 rounded-lg mb-4" />
                    <h4 className="font-semibold text-[var(--color-white)] mb-2">Product {i + 1}</h4>
                    <Text size="sm" className="text-[var(--color-primary)] mb-4">
                      Description of the product goes here.
                    </Text>
                    <Button variant="secondary" size="full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </GridItem>
            ))}
          </GridLayout>
        </div>

        {/* Blog Layout */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-[var(--color-white)]">Blog Layout (Featured + Grid)</h3>
          <GridLayout cols={2} gap="lg">
            <GridItem colSpan={2}>
              <Card variant="gradient-border">
                <CardHeader>
                  <CardTitle>Featured Article</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[var(--color-primary)]">
                    This is the featured article that spans the full width of the layout.
                  </p>
                </CardContent>
              </Card>
            </GridItem>
            {Array.from({ length: 4 }).map((_, i) => (
              <GridItem key={i}>
                <Card>
                  <CardHeader>
                    <CardTitle>Article {i + 1}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Text size="sm" className="text-[var(--color-primary)]">
                      Article excerpt...
                    </Text>
                  </CardContent>
                </Card>
              </GridItem>
            ))}
          </GridLayout>
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const AllFeatures: Story = {
  render: () => (
    <ThemeSection
      title="GridLayout Component"
      description="A flexible CSS Grid layout component for building responsive layouts with ease"
    >
      <div className="space-y-12">
        {/* Basic Grids */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-[var(--color-white)]">Basic Grid Layouts</h3>
          <div className="space-y-6">
            <div>
              <p className="text-[var(--color-primary)] mb-3">Two Columns (Equal)</p>
              <GridLayout cols={2} gap="md">
                <GridItem><DemoBox>Col 1</DemoBox></GridItem>
                <GridItem><DemoBox>Col 2</DemoBox></GridItem>
              </GridLayout>
            </div>
            <div>
              <p className="text-[var(--color-primary)] mb-3">Three Columns (Equal)</p>
              <GridLayout cols={3} gap="md">
                <GridItem><DemoBox>Col 1</DemoBox></GridItem>
                <GridItem><DemoBox>Col 2</DemoBox></GridItem>
                <GridItem><DemoBox>Col 3</DemoBox></GridItem>
              </GridLayout>
            </div>
            <div>
              <p className="text-[var(--color-primary)] mb-3">Four Columns (Equal)</p>
              <GridLayout cols={4} gap="md">
                <GridItem><DemoBox>1</DemoBox></GridItem>
                <GridItem><DemoBox>2</DemoBox></GridItem>
                <GridItem><DemoBox>3</DemoBox></GridItem>
                <GridItem><DemoBox>4</DemoBox></GridItem>
              </GridLayout>
            </div>
          </div>
        </div>

        {/* Fractional Layouts */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-[var(--color-white)]">Fractional Layouts</h3>
          <div className="space-y-6">
            <div>
              <p className="text-[var(--color-primary)] mb-3">2fr 1fr (Dashboard Style - 2/3 + 1/3)</p>
              <GridLayout template="2fr 1fr" gap="md">
                <GridItem><DemoBox className="min-h-[120px]">Main (2fr)</DemoBox></GridItem>
                <GridItem><DemoBox className="min-h-[120px]">Sidebar (1fr)</DemoBox></GridItem>
              </GridLayout>
            </div>
            <div>
              <p className="text-[var(--color-primary)] mb-3">3fr 2fr (60% + 40%)</p>
              <GridLayout template="3fr 2fr" gap="md">
                <GridItem><DemoBox className="min-h-[120px]">Content (3fr)</DemoBox></GridItem>
                <GridItem><DemoBox className="min-h-[120px]">Aside (2fr)</DemoBox></GridItem>
              </GridLayout>
            </div>
          </div>
        </div>

        {/* Column Spans */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-[var(--color-white)]">Column Spans</h3>
          <GridLayout cols={4} gap="md">
            <GridItem colSpan={4}><DemoBox>Full Width (Span 4)</DemoBox></GridItem>
            <GridItem colSpan={3}><DemoBox>Span 3</DemoBox></GridItem>
            <GridItem colSpan={1}><DemoBox>1</DemoBox></GridItem>
            <GridItem colSpan={2}><DemoBox>Span 2</DemoBox></GridItem>
            <GridItem colSpan={2}><DemoBox>Span 2</DemoBox></GridItem>
            <GridItem><DemoBox>1</DemoBox></GridItem>
            <GridItem><DemoBox>1</DemoBox></GridItem>
            <GridItem><DemoBox>1</DemoBox></GridItem>
            <GridItem><DemoBox>1</DemoBox></GridItem>
          </GridLayout>
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
