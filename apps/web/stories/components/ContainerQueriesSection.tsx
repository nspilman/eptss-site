import React from 'react';
import { ThemeSection } from './ThemeSection';

export const ContainerQueriesSection = () => (
  <ThemeSection 
    title="Container Queries" 
    description="Container query variables are defined using --container-* variables."
  >
    <div className="container border border-border p-6 rounded-lg bg-muted">
      <div className="@sm:bg-red-500 @md:bg-green-500 @lg:bg-blue-500 @xl:bg-purple-500 p-4 mb-4 text-white rounded font-medium text-center">
        This element changes color based on container size
      </div>
      <div className="mt-4 grid grid-cols-4 gap-4 text-center text-sm">
        <div className="p-2 bg-red-100 rounded text-red-800">
          <span className="block font-medium">@sm</span>
          <span className="text-xs text-primary">--container-sm</span>
          <span className="text-xs text-muted-foreground">40rem</span>
        </div>
        <div className="p-2 bg-green-100 rounded text-green-800">
          <span className="block font-medium">@md</span>
          <span className="text-xs text-primary">--container-md</span>
          <span className="text-xs text-muted-foreground">48rem</span>
        </div>
        <div className="p-2 bg-blue-100 rounded text-blue-800">
          <span className="block font-medium">@lg</span>
          <span className="text-xs text-primary">--container-lg</span>
          <span className="text-xs text-muted-foreground">64rem</span>
        </div>
        <div className="p-2 bg-purple-100 rounded text-purple-800">
          <span className="block font-medium">@xl</span>
          <span className="text-xs text-primary">--container-xl</span>
          <span className="text-xs text-muted-foreground">80rem</span>
        </div>
      </div>
    </div>
  </ThemeSection>
);
