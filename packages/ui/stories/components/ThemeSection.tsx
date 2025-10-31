import React, { ReactNode } from 'react';

interface ThemeSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const ThemeSection = ({ title, description, children, className = '' }: ThemeSectionProps) => (
  <section className={`mb-12 bg-gray-900/70 p-8 rounded-xl shadow-md ${className}`}>
    <h2 className="text-2xl font-bold mb-6  border-b pb-2">{title}</h2>
    {description && (
      <p className="text-muted-foreground mb-6">{description}</p>
    )}
    {children}
  </section>
);
