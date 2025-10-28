import { ReactNode } from 'react';
import { DashboardLayoutConfig, PanelDefinition, PanelPriority } from '../types';

interface DashboardLayoutProps {
  config?: DashboardLayoutConfig;
  panelsByPriority: Record<PanelPriority, PanelDefinition[]>;
  children: ReactNode;
}

/**
 * DashboardLayout - Handles the layout structure of the dashboard
 *
 * Default layout:
 * - Primary panels: Full width, top priority
 * - Secondary panels: Sidebar or secondary column
 * - Tertiary panels: Below fold, full width
 */
export function DashboardLayout({
  config = { variant: 'default', useGrid: true, gap: 'md' },
  panelsByPriority,
  children,
}: DashboardLayoutProps) {
  const { variant, useGrid, gap = 'md' } = config;

  // For now, just use a simple vertical stack
  // When you add secondary panels later, you can enhance this with a grid
  return (
    <div className="w-full">
      {children}
    </div>
  );
}
