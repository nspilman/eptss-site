import React from 'react';
import { ThemeSection } from './ThemeSection';

interface SpacingItemProps {
  name: string;
  value: string;
  variable: string;
}

const SpacingItem = ({ name, value, variable }: SpacingItemProps) => (
  <div className="flex items-center mb-4">
    <div className="w-24 text-sm font-medium">{name}</div>
    <div 
      className="bg-primary text-primary-foreground text-xs flex items-center justify-center rounded"
      style={{ padding: value }}
    >
      Content
    </div>
    <div className="ml-4 text-xs text-primary">{variable}</div>
    <div className="ml-2 text-xs text-muted-foreground">{value}</div>
  </div>
);

export const SpacingSection = () => (
  <ThemeSection 
    title="Spacing" 
    description="Spacing variables are defined using --spacing-* variables in Tailwind 4."
  >
    <div className="space-y-6 bg-muted p-6 rounded-lg">
      <div>
        <h3 className="text-xl font-semibold mb-4">Basic Spacing Scale</h3>
        <div>
          <SpacingItem name="p-0" value="0px" variable="--spacing-0" />
          <SpacingItem name="p-1" value="0.25rem" variable="--spacing-1" />
          <SpacingItem name="p-2" value="0.5rem" variable="--spacing-2" />
          <SpacingItem name="p-3" value="0.75rem" variable="--spacing-3" />
          <SpacingItem name="p-4" value="1rem" variable="--spacing-4" />
          <SpacingItem name="p-5" value="1.25rem" variable="--spacing-5" />
          <SpacingItem name="p-6" value="1.5rem" variable="--spacing-6" />
          <SpacingItem name="p-8" value="2rem" variable="--spacing-8" />
          <SpacingItem name="p-10" value="2.5rem" variable="--spacing-10" />
          <SpacingItem name="p-12" value="3rem" variable="--spacing-12" />
          <SpacingItem name="p-16" value="4rem" variable="--spacing-16" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Custom Spacing Values</h3>
        <div>
          <SpacingItem name="p-xs" value="0.5rem" variable="--spacing-xs" />
          <SpacingItem name="p-sm" value="1rem" variable="--spacing-sm" />
          <SpacingItem name="p-md" value="1.5rem" variable="--spacing-md" />
          <SpacingItem name="p-lg" value="2rem" variable="--spacing-lg" />
          <SpacingItem name="p-xl" value="2.5rem" variable="--spacing-xl" />
          <SpacingItem name="p-2xl" value="3rem" variable="--spacing-2xl" />
        </div>
      </div>
    </div>
  </ThemeSection>
);
