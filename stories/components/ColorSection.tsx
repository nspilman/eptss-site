import React from 'react';
import { ColorSwatch } from './ColorSwatch';
import { ThemeSection } from './ThemeSection';

interface ColorSectionProps {
  title: string;
  description: string;
  colors: Array<{
    name: string;
    value: string;
    variable: string;
    hexValue?: string;
    className?: string;
  }>;
}

export const ColorSection = ({ title, description, colors }: ColorSectionProps) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold mb-4 ">{title}</h3>
    <p className="text-muted-foreground mb-4">{description}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {colors.map((color) => (
        <ColorSwatch 
          key={color.name}
          colorName={color.name} 
          colorValue={color.value} 
          cssVariable={color.variable}
          hexValue={color.hexValue}
          className={color.className} 
        />
      ))}
    </div>
  </div>
);

export const ColorsSection = () => (
  <ThemeSection 
    title="Colors" 
    description="Colors are defined using the --color-* variables in the @theme directive."
  >
    <ColorSection
      title="Brand Colors"
      description="The primary brand colors used throughout the EPTSS website."
      colors={[
        { name: "Accent Primary", value: "bg-accent-primary", variable: "--color-accent-primary", hexValue: "#e2e240" },
        { name: "Primary", value: "bg-primary", variable: "--color-primary", hexValue: "#f8f9fa" },
        { name: "Background Primary", value: "bg-background-primary", variable: "--color-background-primary", hexValue: "#0a0a14" },
        { name: "Secondary", value: "bg-secondary", variable: "--color-secondary", hexValue: "rgba(17, 24, 39, 0.7)" },
        { name: "White", value: "bg-white", variable: "--color-white", hexValue: "#ffffff" },
      ]}
    />
    
    <ColorSection
      title="Gray Scale"
      description="Gray colors used for text and UI elements."
      colors={[
        { name: "Gray 300", value: "bg-gray-300", variable: "--color-gray-300", hexValue: "#d1d5db" },
        { name: "Gray 400", value: "bg-gray-400", variable: "--color-gray-400", hexValue: "#9ca3af" },
        { name: "Gray 700", value: "bg-gray-700", variable: "--color-gray-700", hexValue: "#374151" },
        { name: "Gray 800", value: "bg-gray-800", variable: "--color-gray-800", hexValue: "#1f2937" },
        { name: "Gray 900", value: "bg-gray-900", variable: "--color-gray-900", hexValue: "#111827" },
        { name: "Gray 900/60%", value: "bg-gray-900/60", variable: "--color-gray-900-60", hexValue: "rgba(17, 24, 39, 0.6)" },
      ]}
    />
    
    <ColorSection
      title="Semantic Colors"
      description="Colors with specific semantic meanings used throughout the application."
      colors={[
        { name: "Destructive", value: "bg-destructive", variable: "--color-destructive", hexValue: "#ef4444" },
        { name: "Destructive Hover", value: "bg-destructive-hover", variable: "--color-destructive-hover", hexValue: "#b91c1c" },
      ]}
    />
    
    <ColorSection
      title="Transparent Colors"
      description="Colors with transparency used for overlays and backgrounds."
      colors={[
        { name: "Background Transparent", value: "bg-transparent", variable: "--color-bg-transparent", hexValue: "hsla(0, 0%, 100%, 0.05)" },
      ]}
    />
  </ThemeSection>
);
