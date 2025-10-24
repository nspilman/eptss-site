import React from 'react';

interface ColorSwatchProps {
  colorName: string;
  colorValue: string;
  cssVariable?: string;
  hexValue?: string;
  className?: string;
}

export const ColorSwatch = ({ 
  colorName, 
  colorValue, 
  cssVariable, 
  hexValue,
  className = ''
}: ColorSwatchProps) => {
  // Determine how to display the color
  const getBackgroundStyle = () => {
    if (cssVariable) {
      return { backgroundColor: `var(${cssVariable})` };
    } else if (hexValue) {
      return { backgroundColor: hexValue };
    } else {
      return {};
    }
  };

  return (
    <div className={`flex flex-col items-center bg-gray-900/70 p-4 rounded-lg shadow-sm ${className}`}>
      <div 
        className={`w-24 h-24 rounded-md mb-3 ${colorValue}`}
        style={getBackgroundStyle()}
      />
      <div className="text-sm font-medium">{colorName}</div>
      <div className="text-xs text-muted-foreground">{colorValue}</div>
      {cssVariable && <div className="text-xs text-primary mt-1">{cssVariable}</div>}
      {hexValue && <div className="text-xs text-muted-foreground/70 mt-1">{hexValue}</div>}
    </div>
  );
};
