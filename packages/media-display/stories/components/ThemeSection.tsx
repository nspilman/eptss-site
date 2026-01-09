import React, { ReactNode } from 'react';
import { Text } from "@eptss/ui";

interface ThemeSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const ThemeSection = ({ title, description, children, className = '' }: ThemeSectionProps) => (
  <section className={`mb-12 bg-gray-900/70 p-8 rounded-xl shadow-md ${className}`}>
    <h2 className="text-2xl font-bold mb-6 border-b pb-2">{title}</h2>
    {description && (
      <Text color="muted" className="mb-6">{description}</Text>
    )}
    {children}
  </section>
);
