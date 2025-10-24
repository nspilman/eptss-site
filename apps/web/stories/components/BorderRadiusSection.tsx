import React from 'react';
import { ThemeSection } from './ThemeSection';

const borderRadii = [
  { name: 'rounded-none', variable: '--radius-none' },
  { name: 'rounded-sm', variable: '--radius-sm' },
  { name: 'rounded', variable: '--radius-base' },
  { name: 'rounded-md', variable: '--radius-md' },
  { name: 'rounded-lg', variable: '--radius-lg' },
  { name: 'rounded-xl', variable: '--radius-xl' },
  { name: 'rounded-2xl', variable: '--radius-2xl' },
  { name: 'rounded-full', variable: '--radius-full' }
];

export const BorderRadiusSection = () => (
  <ThemeSection 
    title="Border Radius" 
    description="Border radius variables are defined using --radius-* variables."
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {borderRadii.map((radius) => (
        <div key={radius.name} className="flex flex-col items-center bg-gray-900/70 p-4 rounded-lg shadow-sm">
          <div className={`w-24 h-24 bg-background-primary ${radius.name} mb-3`}></div>
          <div className="text-sm ">{radius.name}</div>
          <div className="text-xs text-primary mt-1">{radius.variable}</div>
        </div>
      ))}
    </div>
  </ThemeSection>
);
