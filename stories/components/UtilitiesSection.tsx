import React from 'react';
import { ThemeSection } from './ThemeSection';

interface UtilityExampleProps {
  name: string;
  className: string;
  description: string;
  children?: React.ReactNode;
}

const UtilityExample = ({ name, className, description, children }: UtilityExampleProps) => (
  <div className="p-4 bg-gray-800/50 rounded-lg">
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
      <h3 className="text-lg font-medium">{name}</h3>
      <code className="text-sm bg-gray-900 px-2 py-1 rounded mt-1 md:mt-0">.{className}</code>
    </div>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <div className="p-4 bg-gray-900/30 rounded-md">
      {children || (
        <div className={className}>
          Example content with {className} applied
        </div>
      )}
    </div>
  </div>
);

export const UtilitiesSection = () => (
  <ThemeSection
    title="Custom Utilities"
    description="Custom utility classes that extend Tailwind's functionality"
  >
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Container Utilities</h3>
        <p className="text-muted-foreground mb-6">
          Custom container utilities for layout management
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          <UtilityExample 
            name="Container" 
            className="container" 
            description="A responsive container with auto margins and padding"
          >
            <div className="container bg-gray-800 p-4 text-center rounded">
              <p>This is a container element with auto margins and responsive width</p>
              <p className="text-xs text-muted-foreground mt-2">
                Resizes based on viewport width with max-width of 1400px at larger screens
              </p>
            </div>
          </UtilityExample>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Button Utilities</h3>
        <p className="text-muted-foreground mb-6">
          Custom button styling utilities
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UtilityExample 
            name="Main Button" 
            className="btn-main" 
            description="Primary button style with transparent background and white border"
          >
            <button className="btn-main">
              Click Me
            </button>
          </UtilityExample>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">UI Styling Utilities</h3>
        <p className="text-muted-foreground mb-6">
          Custom utilities for UI element styling
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UtilityExample 
            name="Window Border" 
            className="window-border" 
            description="Creates a retro window-style border effect"
          >
            <div className="window-border bg-gray-800 p-4 rounded">
              <p className="text-center">Retro Window Style</p>
            </div>
          </UtilityExample>
        </div>
      </div>
    </div>
  </ThemeSection>
);
