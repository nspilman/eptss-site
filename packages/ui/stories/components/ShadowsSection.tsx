import React from 'react';
import { ThemeSection } from './ThemeSection';

interface ShadowItemProps {
  name: string;
  variable: string;
  description?: string;
  customStyle?: React.CSSProperties;
}

const ShadowItem = ({ name, variable, description, customStyle }: ShadowItemProps) => (
  <div className="flex flex-col items-center bg-gray-900/70 p-4 rounded-lg">
    <div 
      className="w-32 h-32 bg-gray-900/70 border border-border rounded-md mb-3"
      style={customStyle || {}}
    ></div>
    <div className="text-sm font-medium">{name}</div>
    <div className="text-xs text-primary mt-1">{variable}</div>
    {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
  </div>
);

export const ShadowsSection = () => (
  <ThemeSection 
    title="Shadows" 
    description="Shadow variables are defined using --shadow-* variables in Tailwind 4."
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <ShadowItem 
        name="Nav Shadow" 
        variable="--shadow-nav-shadow" 
        description="0px 0px 3px 3px #f6e05e"
        customStyle={{ boxShadow: '0px 0px 3px 3px #f6e05e' }}
      />
    </div>
  </ThemeSection>
);
