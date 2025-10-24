import React from 'react';
import { ColorsSection } from './ColorSection';
import { TypographySection } from './TypographySection';
import { BorderRadiusSection } from './BorderRadiusSection';
import { SpacingSection } from './SpacingSection';
import { ShadowsSection } from './ShadowsSection';
import { ContainerQueriesSection } from './ContainerQueriesSection';

export const ThemeGuide = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto bg-background-primary text-primary min-h-screen">
      <div className="bg-gray-900/70 p-8 rounded-xl shadow-md mb-8">
        <h1 className="text-3xl font-bold mb-3 ">EPTSS Theme Guide</h1>
        <p className="text-muted-foreground">Documentation for Tailwind 4 theme variables used in the EPTSS website</p>
      </div>
      
      <ColorsSection />
      <TypographySection />
      <BorderRadiusSection />
      <SpacingSection />
      <ShadowsSection />
      <ContainerQueriesSection />
    </div>
  );
};
