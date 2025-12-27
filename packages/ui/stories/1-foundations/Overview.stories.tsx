import React from 'react';
import { Meta, StoryObj } from '@storybook/react';

import { Text } from "@eptss/ui";
const ThemeOverview = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto bg-background-primary text-primary min-h-screen">
      <div className="bg-gray-900/70 p-8 rounded-xl shadow-md mb-8">
        <h1 className="text-3xl font-bold mb-3 ">EPTSS Theme Guide</h1>
        <Text color="muted" className="mb-6">Documentation for Tailwind 4 theme variables used in the EPTSS website</Text>
        
        <p className=" mb-4">
          This theme guide documents the design tokens and variables used throughout the EPTSS website. 
          The theme is built using Tailwind CSS 4's theming system with the <code className="bg-muted px-1 py-0.5 rounded text-primary">@theme</code> directive.
        </p>
        
        <Text>
          Each category of theme variables is documented in its own section. Use the Storybook navigation to explore each category.
        </Text>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Colors', description: 'Color palette and semantic color tokens', path: '?path=/story/1-foundations-colors--default' },
          { title: 'Typography', description: 'Font families, sizes, and weights', path: '?path=/story/1-foundations-typography--default' },
          { title: 'Border Radius', description: 'Border radius tokens for UI elements', path: '?path=/story/1-foundations-border-radius--default' },
          { title: 'Spacing', description: 'Spacing scale for margins, padding, and gaps', path: '?path=/story/1-foundations-spacing--default' },
          { title: 'Shadows', description: 'Shadow tokens for depth and elevation', path: '?path=/story/1-foundations-shadows--default' },
          { title: 'Animations', description: 'Animation keyframes and utility classes', path: '?path=/story/6-animation-animations--default' },
          { title: 'Utilities', description: 'Custom utility classes for UI components', path: '?path=/story/6-animation-utilities--default' },
          { title: 'Container Queries', description: 'Container query breakpoints', path: '?path=/story/6-animation-container-queries--default' },
        ].map((section) => (
          <a 
            key={section.title} 
            href={section.path} 
            className="block bg-gray-900/70 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-border hover:border-primary"
          >
            <h2 className="text-xl font-semibold mb-2 ">{section.title}</h2>
            <Text color="muted">{section.description}</Text>
          </a>
        ))}
      </div>
    </div>
  );
};

const meta: Meta<typeof ThemeOverview> = {
  title: '1. Foundations/Overview',
  component: ThemeOverview,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeOverview>;

export const Default: Story = {};
