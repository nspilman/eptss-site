import React from 'react';

interface TypographyExampleProps {
  name: string;
  className: string;
  cssVariable?: string;
  description?: string;
}

export const TypographyExample = ({ name, className, cssVariable, description }: TypographyExampleProps) => (
  <div className="mb-6 bg-gray-900/70 p-4 rounded-lg shadow-sm">
    <div className="text-sm text-muted-foreground mb-2">{name}</div>
    <div className={`${className} `}>
      The quick brown fox jumps over the lazy dog
    </div>
    {cssVariable && <div className="text-xs text-primary mt-2">{cssVariable}</div>}
    {description && <div className="text-xs text-muted-foreground mt-1">{description}</div>}
  </div>
);
