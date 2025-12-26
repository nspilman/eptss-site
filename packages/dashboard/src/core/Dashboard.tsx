import { Suspense } from 'react';
import { DashboardConfig, PanelDefinition, PanelPriority } from '../types';
import { PanelWrapper } from './PanelWrapper';
import { GridLayout, GridItem } from '@eptss/ui';

interface DashboardProps {
  config: DashboardConfig;
  user?: {
    id: string;
    role: string;
  };
  /** Optional data to pass to specific panels, keyed by panel ID */
  panelData?: Record<string, any>;
}

/**
 * Dashboard - Main dashboard component that renders all panels
 *
 * This component handles:
 * - Panel filtering by user role
 * - Panel sorting by priority and order
 * - Layout rendering (grid or stack)
 * - Suspense boundaries for async panels
 * - Passing data to panels via panelData prop
 * 
 * This is a Server Component by default (no 'use client')
 */
export function Dashboard({ config, user, panelData }: DashboardProps) {
  const { panels, layout, header: Header, footer: Footer } = config;

  // Filter panels based on user role
  const visiblePanels = panels.filter((panel) => {
    if (!panel.config.requiredRole) return true;
    if (!user) return false;

    // Simple role check - can be extended with more complex logic
    if (panel.config.requiredRole === 'admin' && user.role !== 'admin') {
      return false;
    }

    return true;
  });

  // Sort panels by priority then order
  const sortedPanels = sortPanels(visiblePanels);

  // Group panels by layout zone
  const panelsByZone = groupByLayoutZone(sortedPanels);

  // Helper to render a panel
  const renderPanel = (panel: PanelDefinition) => {
    const { config, component: Component, skeleton: Skeleton } = panel;
    const panelProps = {
      config,
      user,
      data: panelData?.[config.id],
    };

    return (
      <PanelWrapper key={config.id} config={config}>
        {config.showSkeleton !== false && Skeleton ? (
          <Suspense fallback={<Skeleton />}>
            <Component {...panelProps} />
          </Suspense>
        ) : (
          <Component {...panelProps} />
        )}
      </PanelWrapper>
    );
  };

  // Get gap from layout config
  const gap = layout?.gap || 'md';

  return (
    <div className="w-full">
      {Header && <Header />}

      <GridLayout template="2fr 1fr" gap={gap}>
        {/* Header zone - Full width */}
        {panelsByZone.header.length > 0 && (
          <GridItem colSpan="full">
            <div className="flex flex-col gap-6">
              {panelsByZone.header.map(renderPanel)}
            </div>
          </GridItem>
        )}

        {/* Main zone - 2fr (2/3 width) */}
        {panelsByZone.main.length > 0 && (
          <GridItem>
            <div className="h-full flex flex-col gap-6">
              {panelsByZone.main.map(renderPanel)}
            </div>
          </GridItem>
        )}

        {/* Sidebar zone - 1fr (1/3 width) */}
        {panelsByZone.sidebar.length > 0 && (
          <GridItem>
            <div className="h-full flex flex-col gap-6">
              {panelsByZone.sidebar.map(renderPanel)}
            </div>
          </GridItem>
        )}

        {/* Footer zone - Full width */}
        {panelsByZone.footer.length > 0 && (
          <GridItem colSpan="full">
            <div className="flex flex-col gap-6">
              {panelsByZone.footer.map(renderPanel)}
            </div>
          </GridItem>
        )}
      </GridLayout>

      {Footer && <Footer />}
    </div>
  );
}

/**
 * Sort panels by priority (primary > secondary > tertiary) then by order
 */
function sortPanels(panels: PanelDefinition[]): PanelDefinition[] {
  const priorityOrder: Record<PanelPriority, number> = {
    primary: 1,
    secondary: 2,
    tertiary: 3,
  };

  return [...panels].sort((a, b) => {
    const priorityDiff =
      priorityOrder[a.config.priority] - priorityOrder[b.config.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.config.order - b.config.order;
  });
}

/**
 * Group panels by layout zone
 */
type LayoutZone = 'header' | 'main' | 'sidebar' | 'footer';

function groupByLayoutZone(
  panels: PanelDefinition[]
): Record<LayoutZone, PanelDefinition[]> {
  return panels.reduce(
    (acc, panel) => {
      const zone = panel.config.layoutZone || getDefaultZone(panel.config.priority);
      if (!acc[zone]) {
        acc[zone] = [];
      }
      acc[zone].push(panel);
      return acc;
    },
    {
      header: [],
      main: [],
      sidebar: [],
      footer: [],
    } as Record<LayoutZone, PanelDefinition[]>
  );
}

/**
 * Get default layout zone based on priority (fallback for panels without explicit layoutZone)
 */
function getDefaultZone(priority: PanelPriority): LayoutZone {
  switch (priority) {
    case 'primary':
      return 'main';
    case 'secondary':
      return 'sidebar';
    case 'tertiary':
      return 'footer';
  }
}
