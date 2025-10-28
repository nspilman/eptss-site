import { ComponentType } from 'react';
import { PanelConfig, PanelDefinition, PanelProps } from '../types';

/**
 * Panel Registry - Simple utility for creating panel definitions
 */

/**
 * Create a panel definition with type-safe configuration
 */
export function createPanel<T = any>(
  config: PanelConfig,
  component: ComponentType<PanelProps<T>>,
  options?: {
    skeleton?: ComponentType;
    fetchData?: () => Promise<T>;
  }
): PanelDefinition<T> {
  return {
    config,
    component,
    skeleton: options?.skeleton,
    fetchData: options?.fetchData,
  };
}

/**
 * Create multiple panels at once
 */
export function createPanels(
  panels: Array<{
    config: PanelConfig;
    component: ComponentType<PanelProps>;
    skeleton?: ComponentType;
    fetchData?: () => Promise<any>;
  }>
): PanelDefinition[] {
  return panels.map((panel) =>
    createPanel(panel.config, panel.component, {
      skeleton: panel.skeleton,
      fetchData: panel.fetchData,
    })
  );
}

/**
 * Helper to create a panel config with sensible defaults
 */
export function definePanelConfig(
  id: string,
  overrides?: Partial<PanelConfig>
): PanelConfig {
  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    priority: 'secondary',
    order: 100,
    collapsible: false,
    defaultCollapsed: false,
    showSkeleton: true,
    ...overrides,
  };
}
