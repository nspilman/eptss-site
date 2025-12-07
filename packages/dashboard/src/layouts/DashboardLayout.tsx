import { ReactNode, Children } from 'react';
import { DashboardLayoutConfig, PanelDefinition, PanelPriority } from '../types';

interface DashboardLayoutProps {
  config?: DashboardLayoutConfig;
  panelsByPriority: Record<PanelPriority, PanelDefinition[]>;
  children: ReactNode;
}

/**
 * DashboardLayout - Handles the layout structure of the dashboard
 *
 * Responsibilities:
 * - Layout zones (header, main, sidebar, footer)
 * - Sizing constraints (width, height, min/max)
 * - Responsive behavior (mobile stacking)
 * - Spacing between panels
 *
 * DOES NOT handle:
 * - Visual styling (that's PanelCard)
 * - Panel content (that's the panel components)
 */
export function DashboardLayout({
  config = { variant: 'default', useGrid: true, gap: 'md' },
  panelsByPriority,
  children,
}: DashboardLayoutProps) {
  const { variant, useGrid, gap = 'md' } = config;

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const gapClass = gapClasses[gap];

  // Convert children to array to map panel IDs
  const childrenArray = Children.toArray(children);

  // Group children by their layout zone
  const headerPanels: Array<{ child: ReactNode; config: PanelDefinition['config'] }> = [];
  const mainPanels: Array<{ child: ReactNode; config: PanelDefinition['config'] }> = [];
  const sidebarPanels: Array<{ child: ReactNode; config: PanelDefinition['config'] }> = [];
  const footerPanels: Array<{ child: ReactNode; config: PanelDefinition['config'] }> = [];

  // Map children to their layout groups based on layoutZone
  const allPanels = [
    ...panelsByPriority.primary,
    ...panelsByPriority.secondary,
    ...panelsByPriority.tertiary,
  ];

  childrenArray.forEach((child, index) => {
    if (index < allPanels.length) {
      const panel = allPanels[index];
      const layoutZone = panel.config.layoutZone;
      const panelWithConfig = { child, config: panel.config };

      // Route to layout zone (with fallback to priority-based routing)
      if (layoutZone === 'header') {
        headerPanels.push(panelWithConfig);
      } else if (layoutZone === 'sidebar') {
        sidebarPanels.push(panelWithConfig);
      } else if (layoutZone === 'main') {
        mainPanels.push(panelWithConfig);
      } else if (layoutZone === 'footer') {
        footerPanels.push(panelWithConfig);
      }
      // Fallback: use priority if no layoutZone specified
      else if (panel.config.priority === 'primary') {
        mainPanels.push(panelWithConfig);
      } else if (panel.config.priority === 'secondary') {
        sidebarPanels.push(panelWithConfig);
      } else {
        footerPanels.push(panelWithConfig);
      }
    }
  });

  // Helper to apply sizing constraints
  const applyConstraints = (panelConfig: PanelDefinition['config']) => {
    const styles: React.CSSProperties = {};
    if (panelConfig.minHeight) styles.minHeight = panelConfig.minHeight;
    if (panelConfig.maxHeight) styles.maxHeight = panelConfig.maxHeight;
    return styles;
  };

  // If there are no sidebar panels, use simple vertical stack
  if (sidebarPanels.length === 0) {
    return (
      <div className={`w-full flex flex-col ${gapClass}`}>
        {headerPanels.map((p, i) => (
          <div key={i} className="w-full min-w-0" style={applyConstraints(p.config)}>
            {p.child}
          </div>
        ))}
        {mainPanels.map((p, i) => (
          <div key={i} className="w-full min-w-0" style={applyConstraints(p.config)}>
            {p.child}
          </div>
        ))}
        {footerPanels.map((p, i) => (
          <div key={i} className="w-full min-w-0" style={applyConstraints(p.config)}>
            {p.child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`w-full flex flex-col ${gapClass}`}>
      {/* Header Zone - Full Width */}
      {headerPanels.map((p, i) => (
        <div key={i} className="w-full min-w-0" style={applyConstraints(p.config)}>
          {p.child}
        </div>
      ))}

      {/* Main + Sidebar Layout */}
      <div className={`flex flex-col md:flex-row ${gapClass}`}>
        {/* Sidebar Zone - Left (stacks on top on mobile) */}
        <aside className={`w-full md:w-1/2 flex flex-col ${gapClass} min-w-0`}>
          {sidebarPanels.map((p, i) => (
            <div key={i} className="w-full min-w-0" style={applyConstraints(p.config)}>
              {p.child}
            </div>
          ))}
        </aside>

        {/* Main Zone - Right */}
        <div className={`w-full md:w-1/2 flex flex-col ${gapClass} min-w-0`}>
          {mainPanels.map((p, i) => (
            <div key={i} className="w-full min-w-0" style={applyConstraints(p.config)}>
              {p.child}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Zone - Full Width */}
      {footerPanels.map((p, i) => (
        <div key={i} className="w-full min-w-0" style={applyConstraints(p.config)}>
          {p.child}
        </div>
      ))}
    </div>
  );
}
