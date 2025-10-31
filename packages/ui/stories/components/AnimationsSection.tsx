import React from 'react';
import { ThemeSection } from './ThemeSection';

interface AnimationExampleProps {
  name: string;
  variable: string;
  className?: string;
  description?: string;
}

const AnimationExample = ({ name, variable, className, description }: AnimationExampleProps) => (
  <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
      <h3 className="text-lg font-medium">{name}</h3>
      <code className="text-sm bg-gray-900 px-2 py-1 rounded mt-1 md:mt-0">{variable}</code>
    </div>
    {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
    <div className="h-24 flex items-center justify-center bg-gray-900/30 rounded-md overflow-hidden">
      <div 
        className={`w-16 h-16 bg-accent-primary rounded-md ${className}`}
        style={{ animationPlayState: 'running' }}
      ></div>
    </div>
  </div>
);

export const AnimationsSection = () => (
  <ThemeSection
    title="Animations"
    description="Animation variables and keyframes defined using the --animate-* variables in the @theme directive."
  >
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Animation Variables</h3>
        <p className="text-muted-foreground mb-6">
          These animation variables can be used directly in your components by referencing the CSS variable.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimationExample 
            name="Accordion Down" 
            variable="--animate-accordion-down" 
            className="animate-[accordion-down_0.2s_ease-out]"
            description="Used for accordion expanding animations"
          />
          
          <AnimationExample 
            name="Accordion Up" 
            variable="--animate-accordion-up" 
            className="animate-[accordion-up_0.2s_ease-out]"
            description="Used for accordion collapsing animations"
          />
          
          <AnimationExample 
            name="Blob" 
            variable="--animate-blob" 
            className="animate-[blob_7s_infinite]"
            description="Organic blob movement animation"
          />
          
          <AnimationExample 
            name="Tilt" 
            variable="--animate-tilt" 
            className="animate-[tilt_10s_infinite_linear]"
            description="Subtle tilting animation for UI elements"
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Animation Utilities</h3>
        <p className="text-muted-foreground mb-6">
          These utility classes can be applied to elements to modify their animation behavior.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Animation Delay 2s</h3>
              <code className="text-sm bg-gray-900 px-2 py-1 rounded mt-1 md:mt-0">.animation-delay-2000</code>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Delays the start of an animation by 2 seconds</p>
            <div className="h-24 flex items-center justify-center bg-gray-900/30 rounded-md">
              <div className="w-16 h-16 bg-accent-primary rounded-md animate-[blob_7s_infinite] animation-delay-2000"></div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Animation Delay 4s</h3>
              <code className="text-sm bg-gray-900 px-2 py-1 rounded mt-1 md:mt-0">.animation-delay-4000</code>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Delays the start of an animation by 4 seconds</p>
            <div className="h-24 flex items-center justify-center bg-gray-900/30 rounded-md">
              <div className="w-16 h-16 bg-accent-primary rounded-md animate-[blob_7s_infinite] animation-delay-4000"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ThemeSection>
);
