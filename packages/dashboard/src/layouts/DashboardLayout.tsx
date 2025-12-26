import { ReactNode, Children } from 'react';
import { DashboardLayoutConfig, PanelDefinition, PanelPriority } from '../types';

interface DashboardLayoutProps {
  config?: DashboardLayoutConfig;
  panelsByPriority: Record<PanelPriority, PanelDefinition[]>;
  children: ReactNode;
}

/**
 * DashboardLayout - Handles the layout structure of the dashboard using CSS Grid
 *
 * Responsibilities:
 * - Layout zones (header, main, sidebar, footer)
 * - Sizing constraints (width, height, min/max)
 * - Responsive behavior (mobile stacking)
 * - Spacing between panels
 *
 * Grid Structure:
 * - Desktop: 3-column grid (main: 2fr, sidebar: 1fr) = 2/3 - 1/3 split
 * - Mobile: Single column (all panels stack)
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
  const { gap = 'md' } = config;

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

  return (
    <div className={`w-full grid ${gapClass}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .dashboard-grid-layout {
            grid-template-columns: 1fr;
          }
          @media (min-width: 768px) {
            .dashboard-grid-layout {
              grid-template-columns: 2fr 1fr;
            }
          }
        `
      }} />
      <div className="dashboard-grid-layout w-full grid" style={{ gap: 'inherit' }}>
        {/* Header Zone - Full Width - Always row 1, spans all columns */}
        {headerPanels.length > 0 && (
          <div className="col-span-full flex flex-col gap-6 min-w-0">
            {headerPanels.map((p, i) => (
              <div key={i} className="w-full min-w-0" style={applyConstraints(p.config)}>
                {p.child}
              </div>
            ))}
          </div>
        )}

        {/* Main Zone - 2fr (2/3 width on desktop) - Column 1 */}
        {mainPanels.length > 0 && (
          <div className="flex flex-col gap-6 min-w-0">
            {mainPanels.map((p, i) => (
              <div key={i} className="w-full min-w-0" style={applyConstraints(p.config)}>
                {p.child}
              </div>
            ))}
          </div>
        )}

        {/* Sidebar Zone - 1fr (1/3 width on desktop) - Column 2 */}
        {sidebarPanels.length > 0 && (
          <aside className="flex flex-col gap-6 min-w-0">
            {sidebarPanels.map((p, i) => (
              <div key={i} className="w-full min-w-0" style={applyConstraints(p.config)}>
                {p.child}
              </div>
            ))}
          </aside>
        )}

        {/* Footer Zone - Full Width - Spans all columns */}
        {footerPanels.length > 0 && (
          <div className="col-span-full flex flex-col gap-6 min-w-0">
            {footerPanels.map((p, i) => (
              <div key={i} className="w-full min-w-0" style={applyConstraints(p.config)}>
                {p.child}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
