import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { SectionHeader } from '../../src/components/ui/primitives/section-header';
import { ThemeSection } from '../components/ThemeSection';

const meta: Meta<typeof SectionHeader> = {
  title: '4. Display/Section Header',
  component: SectionHeader,
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
      options: ['default', 'accent-border'],
      description: 'The visual style of the section header'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the section header'
    },
    align: {
      control: 'select',
      options: ['left', 'center'],
      description: 'Text alignment'
    },
    borderColor: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Border color for accent-border variant'
    },
    title: {
      control: 'text',
      description: 'Section title text'
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle text'
    },
  },
  args: {
    title: 'Section Title',
    subtitle: 'Optional subtitle description',
    variant: 'default',
    size: 'md',
    align: 'left',
    borderColor: 'primary',
  }
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = {};

export const AccentBorder: Story = {
  args: {
    variant: 'accent-border',
    title: 'Your Information',
    subtitle: 'We\'ll send you a verification link to complete your signup',
  },
};

export const AccentBorderSecondary: Story = {
  args: {
    variant: 'accent-border',
    borderColor: 'secondary',
    title: 'Round Signup',
    subtitle: 'Enter the song you\'d like to cover for this round',
  },
};

export const CenteredLarge: Story = {
  args: {
    size: 'lg',
    align: 'center',
    title: 'How It Works',
    subtitle: 'A simple process designed to spark your creativity',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    title: 'Small Header',
    subtitle: 'Compact size for tight spaces',
  },
};

export const NoSubtitle: Story = {
  args: {
    title: 'Just a Title',
    subtitle: undefined,
  },
};

export const AllVariants: Story = {
  render: () => (
    <ThemeSection
      title="Section Header Variants"
      description="Section headers provide consistent styling for content sections. Use accent-border for form sections, default for general content."
    >
      <div className="flex flex-col gap-8 w-full max-w-3xl">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">Default Variant</h3>
          <SectionHeader
            title="Default Section"
            subtitle="Simple section header without border"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">Accent Border (Primary)</h3>
          <SectionHeader
            variant="accent-border"
            borderColor="primary"
            title="Your Information"
            subtitle="We'll send you a verification link to complete your signup"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">Accent Border (Secondary)</h3>
          <SectionHeader
            variant="accent-border"
            borderColor="secondary"
            title="Round Signup"
            subtitle="Enter the song you'd like to cover for this round"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">Centered Large</h3>
          <SectionHeader
            size="lg"
            align="center"
            title="How It Works"
            subtitle="A simple process designed to spark your creativity"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">Small Size</h3>
          <SectionHeader
            size="sm"
            title="Compact Section"
            subtitle="Smaller text for dense layouts"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">No Subtitle</h3>
          <SectionHeader
            title="Connect"
          />
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
