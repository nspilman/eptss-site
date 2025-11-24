import type { Meta, StoryObj } from '@storybook/react'
import { Display, Heading, Text, Label, Quote } from '../../src/components/ui/primitives'

const meta = {
  title: '2. Primitives/Typography',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta

// Display Stories
export const DisplayShowcase: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Display Small</Label>
        <Display size="sm">Everyone Plays the Same Song</Display>
      </div>
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Display Medium (Default)</Label>
        <Display size="md">Everyone Plays the Same Song</Display>
      </div>
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Display Large</Label>
        <Display size="lg">Everyone Plays the Same Song</Display>
      </div>
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Display with Gradient</Label>
        <Display size="md" gradient>Everyone Plays the Same Song</Display>
      </div>
    </div>
  ),
}

export const DisplaySmall: StoryObj<typeof Display> = {
  args: {
    size: 'sm',
    children: 'Display Small',
  },
  render: (args) => <Display {...args} />,
}

export const DisplayMedium: StoryObj<typeof Display> = {
  args: {
    size: 'md',
    children: 'Display Medium',
  },
  render: (args) => <Display {...args} />,
}

export const DisplayLarge: StoryObj<typeof Display> = {
  args: {
    size: 'lg',
    children: 'Display Large',
  },
  render: (args) => <Display {...args} />,
}

export const DisplayGradient: StoryObj<typeof Display> = {
  args: {
    size: 'md',
    gradient: true,
    children: 'Gradient Display',
  },
  render: (args) => <Display {...args} />,
}

// Heading Stories
export const HeadingShowcase: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Heading XS</Label>
        <Heading size="xs">This is an extra small heading</Heading>
      </div>
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Heading Small</Label>
        <Heading size="sm">This is a small heading</Heading>
      </div>
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Heading Medium (Default)</Label>
        <Heading size="md">This is a medium heading</Heading>
      </div>
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Heading Large</Label>
        <Heading size="lg">This is a large heading</Heading>
      </div>
    </div>
  ),
}

export const HeadingH2: StoryObj<typeof Heading> = {
  args: {
    as: 'h2',
    size: 'md',
    children: 'Section Heading',
  },
  render: (args) => <Heading {...args} />,
}

export const HeadingH3: StoryObj<typeof Heading> = {
  args: {
    as: 'h3',
    size: 'sm',
    children: 'Subsection Heading',
  },
  render: (args) => <Heading {...args} />,
}

// Text Stories
export const TextShowcase: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Text Sizes</Label>
        <div className="space-y-2">
          <Text size="xs">Extra small text (12px)</Text>
          <Text size="sm">Small text (14px)</Text>
          <Text size="base">Base text (16px)</Text>
          <Text size="lg">Large text (18px)</Text>
          <Text size="xl">Extra large text (20px)</Text>
        </div>
      </div>
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Text Colors</Label>
        <div className="space-y-2">
          <Text color="primary">Primary color text</Text>
          <Text color="secondary">Secondary color text (gray-400)</Text>
          <Text color="tertiary">Tertiary color text (gray-300, default)</Text>
          <Text color="muted">Muted color text</Text>
          <Text color="accent">Accent color text (yellow)</Text>
          <Text color="accent-secondary">Accent secondary color text (cyan)</Text>
          <Text color="destructive">Destructive color text (red)</Text>
        </div>
      </div>
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Text Weights</Label>
        <div className="space-y-2">
          <Text weight="normal">Normal weight text</Text>
          <Text weight="medium">Medium weight text</Text>
          <Text weight="semibold">Semibold weight text</Text>
          <Text weight="bold">Bold weight text</Text>
        </div>
      </div>
    </div>
  ),
}

export const TextParagraph: StoryObj<typeof Text> = {
  args: {
    size: 'base',
    color: 'tertiary',
    children: 'This is a paragraph of body text. It uses the Roboto font family and follows the design system color scheme.',
  },
  render: (args) => <Text {...args} />,
}

export const TextAccent: StoryObj<typeof Text> = {
  args: {
    size: 'base',
    color: 'accent',
    weight: 'semibold',
    children: 'This is accented text',
  },
  render: (args) => <Text {...args} />,
}

export const TextDestructive: StoryObj<typeof Text> = {
  args: {
    size: 'sm',
    color: 'destructive',
    weight: 'medium',
    children: 'Error: This field is required',
  },
  render: (args) => <Text {...args} />,
}

// Label Stories
export const LabelShowcase: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Label Sizes</Label>
        <div className="space-y-2">
          <div>
            <Label size="xs">Extra small label</Label>
          </div>
          <div>
            <Label size="sm">Small label</Label>
          </div>
        </div>
      </div>
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Label Colors</Label>
        <div className="space-y-2">
          <div>
            <Label color="primary">Primary label</Label>
          </div>
          <div>
            <Label color="secondary">Secondary label (gray-400, default)</Label>
          </div>
          <div>
            <Label color="accent">Accent label (yellow)</Label>
          </div>
          <div>
            <Label color="accent-secondary">Accent secondary label (cyan)</Label>
          </div>
          <div>
            <Label color="destructive">Destructive label (red)</Label>
          </div>
        </div>
      </div>
    </div>
  ),
}

export const LabelMetadata: StoryObj<typeof Label> = {
  args: {
    size: 'xs',
    color: 'secondary',
    children: '@username',
  },
  render: (args) => <Label {...args} />,
}

export const LabelBadge: StoryObj<typeof Label> = {
  args: {
    size: 'xs',
    color: 'accent-secondary',
    className: 'inline-block bg-[var(--color-gray-900-40)] px-3 py-1 rounded-full border border-[var(--color-gray-700)]',
    children: 'Published Mar 15, 2024',
  },
  render: (args) => <Label {...args} />,
}

export const LabelDestructive: StoryObj<typeof Label> = {
  args: {
    size: 'xs',
    color: 'destructive',
    children: 'Required',
  },
  render: (args) => <Label {...args} />,
}

// Quote Stories
export const QuoteShowcase: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <Label size="sm" color="secondary" className="mb-2 block">Quote Sizes</Label>
        <div className="space-y-4">
          <Quote size="base">
            "This is a base-sized quote."
          </Quote>
          <Quote size="lg">
            "This is a large quote (default)."
          </Quote>
          <Quote size="xl">
            "This is an extra large quote for testimonials."
          </Quote>
        </div>
      </div>
    </div>
  ),
}

export const QuoteTestimonial: StoryObj<typeof Quote> = {
  args: {
    size: 'xl',
    className: 'mb-4',
    children: '"Everyone Plays the Same Song provides the community and direction I\'ve needed to consistently make music and improve for the last two years."',
  },
  render: (args) => (
    <div className="max-w-3xl mx-auto text-center">
      <Quote {...args} />
      <Text color="accent" weight="medium">— David, Participant</Text>
    </div>
  ),
}

// Color System Reference
export const ColorSystemReference: StoryObj = {
  render: () => (
    <div className="space-y-8">
      <div>
        <Heading size="md" className="mb-6">Typography Color System</Heading>
        <Text size="sm" color="secondary" className="mb-8">
          Consistent color tokens across Text and Label components
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Text Colors */}
        <div className="space-y-4">
          <Heading size="sm" as="h3">Text Colors</Heading>
          <div className="space-y-3 p-4 bg-[var(--color-gray-900)] rounded-lg">
            <div className="flex items-baseline justify-between">
              <Text color="primary">Primary</Text>
              <Label size="xs" color="secondary">var(--color-primary)</Label>
            </div>
            <div className="flex items-baseline justify-between">
              <Text color="secondary">Secondary</Text>
              <Label size="xs" color="secondary">var(--color-gray-400)</Label>
            </div>
            <div className="flex items-baseline justify-between">
              <Text color="tertiary">Tertiary (default)</Text>
              <Label size="xs" color="secondary">var(--color-gray-300)</Label>
            </div>
            <div className="flex items-baseline justify-between">
              <Text color="muted">Muted</Text>
              <Label size="xs" color="secondary">var(--color-muted-foreground)</Label>
            </div>
            <div className="flex items-baseline justify-between">
              <Text color="accent">Accent</Text>
              <Label size="xs" color="secondary">var(--color-accent-primary) yellow</Label>
            </div>
            <div className="flex items-baseline justify-between">
              <Text color="accent-secondary">Accent Secondary</Text>
              <Label size="xs" color="secondary">var(--color-accent-secondary) cyan</Label>
            </div>
            <div className="flex items-baseline justify-between">
              <Text color="destructive">Destructive</Text>
              <Label size="xs" color="secondary">var(--color-destructive) red</Label>
            </div>
          </div>
        </div>

        {/* Label Colors */}
        <div className="space-y-4">
          <Heading size="sm" as="h3">Label Colors</Heading>
          <div className="space-y-3 p-4 bg-[var(--color-gray-900)] rounded-lg">
            <div className="flex items-baseline justify-between">
              <Label color="primary">Primary</Label>
              <Label size="xs" color="secondary">var(--color-primary)</Label>
            </div>
            <div className="flex items-baseline justify-between">
              <Label color="secondary">Secondary (default)</Label>
              <Label size="xs" color="secondary">var(--color-gray-400)</Label>
            </div>
            <div className="flex items-baseline justify-between">
              <Label color="accent">Accent</Label>
              <Label size="xs" color="secondary">var(--color-accent-primary) yellow</Label>
            </div>
            <div className="flex items-baseline justify-between">
              <Label color="accent-secondary">Accent Secondary</Label>
              <Label size="xs" color="secondary">var(--color-accent-secondary) cyan</Label>
            </div>
            <div className="flex items-baseline justify-between">
              <Label color="destructive">Destructive</Label>
              <Label size="xs" color="secondary">var(--color-destructive) red</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-4 pt-8 border-t border-[var(--color-gray-800)]">
        <Heading size="sm" as="h3">Common Usage Patterns</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--color-gray-900)] rounded-lg space-y-2">
            <Label size="xs" color="accent-secondary">Success Message</Label>
            <Text color="accent-secondary" weight="medium">✓ Changes saved successfully</Text>
          </div>
          <div className="p-4 bg-[var(--color-gray-900)] rounded-lg space-y-2">
            <Label size="xs" color="destructive">Error Message</Label>
            <Text color="destructive" weight="medium">✗ This field is required</Text>
          </div>
          <div className="p-4 bg-[var(--color-gray-900)] rounded-lg space-y-2">
            <Label size="xs" color="accent">Highlighted Info</Label>
            <Text color="accent" weight="medium">→ New feature available</Text>
          </div>
          <div className="p-4 bg-[var(--color-gray-900)] rounded-lg space-y-2">
            <Label size="xs" color="secondary">Metadata</Label>
            <Text color="secondary" size="sm">Posted 2 hours ago</Text>
          </div>
        </div>
      </div>
    </div>
  ),
}

// Complete Typography System
export const CompleteTypographySystem: StoryObj = {
  render: () => (
    <div className="max-w-4xl space-y-12">
      {/* Hero Section */}
      <section>
        <Display size="lg" className="mb-4">
          Typography System
        </Display>
        <Text size="lg" color="tertiary" className="mb-6">
          A comprehensive, consistent typography system for the EPTSS platform
        </Text>
        <div className="w-20 h-1 rounded bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)]" />
      </section>

      {/* Article Example */}
      <section className="space-y-6">
        <div>
          <Label size="xs" color="accent" className="inline-block bg-[var(--color-gray-900-40)] px-3 py-1 rounded-full border border-[var(--color-gray-700)] mb-4">
            March 15, 2024
          </Label>
          <Display size="md" className="mb-3">
            Building a Community Through Music
          </Display>
          <Text size="sm" color="secondary" className="mb-2">
            by <Text as="span" color="accent" weight="medium">Nate Spielman</Text>
          </Text>
          <Text size="lg" color="tertiary" className="mb-4">
            Discover how shared musical experiences create lasting connections
          </Text>
        </div>

        <Heading size="md" as="h2" className="mb-3">
          The Power of Collaboration
        </Heading>
        <Text color="tertiary" className="mb-4">
          When musicians come together to create, something magical happens. Each person brings their unique voice, style, and perspective to the same foundational piece. The result is a rich tapestry of interpretations that celebrates both individual creativity and collective experience.
        </Text>

        <Heading size="sm" as="h3" className="mb-3">
          How It Works
        </Heading>
        <Text color="tertiary" className="mb-4">
          Every quarter, our community votes on a song. Participants have three months to record their version, then we celebrate together at a listening party. It's structured creativity with complete artistic freedom.
        </Text>

        <Quote size="xl" className="my-8">
          "The best part is hearing how everyone interprets the same song differently. It's like seeing the same landscape through twenty different cameras."
        </Quote>
        <Text color="accent" weight="medium" className="text-right">
          — Sarah, 2-year member
        </Text>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-3 gap-6 py-8 border-y border-[var(--color-gray-800)]">
        <div className="text-center">
          <Display size="sm" gradient className="mb-2">250+</Display>
          <Label size="sm" color="secondary">Active Musicians</Label>
        </div>
        <div className="text-center">
          <Display size="sm" gradient className="mb-2">12</Display>
          <Label size="sm" color="secondary">Rounds Completed</Label>
        </div>
        <div className="text-center">
          <Display size="sm" gradient className="mb-2">500+</Display>
          <Label size="sm" color="secondary">Songs Covered</Label>
        </div>
      </section>
    </div>
  ),
}
