import { Suspense } from 'react';
import { DashboardConfig, PanelDefinition, PanelPriority } from '../types';
import { PanelWrapper } from './PanelWrapper';
import { DashboardLayout } from '../layouts/DashboardLayout';

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

  // Group panels by priority
  const panelsByPriority = groupByPriority(sortedPanels);

  return (
    <div className="w-full">
      {Header && <Header />}

      <DashboardLayout config={layout} panelsByPriority={panelsByPriority}>
        {sortedPanels.map((panel) => {
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
        })}
      </DashboardLayout>

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
 * Group panels by priority level
 */
function groupByPriority(
  panels: PanelDefinition[]
): Record<PanelPriority, PanelDefinition[]> {
  return panels.reduce(
    (acc, panel) => {
      const priority = panel.config.priority;
      if (!acc[priority]) {
        acc[priority] = [];
      }
      acc[priority].push(panel);
      return acc;
    },
    {
      primary: [],
      secondary: [],
      tertiary: [],
    } as Record<PanelPriority, PanelDefinition[]>
  );
}
