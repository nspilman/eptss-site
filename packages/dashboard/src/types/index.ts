import { ReactNode, ComponentType } from 'react';

/**
 * Panel Priority determines layout position and visual weight
 * - primary: Main content area, hero position, largest visual weight
 * - secondary: Sidebar or supplementary content
 * - tertiary: Below-the-fold, collapsible, or low-priority content
 */
export type PanelPriority = 'primary' | 'secondary' | 'tertiary';

/**
 * Panel Size determines width in grid layout
 */
export type PanelSize = 'full' | 'half' | 'third' | 'two-thirds';

/**
 * Layout Zone determines where panel appears in dashboard structure
 */
export type LayoutZone = 'header' | 'main' | 'sidebar' | 'footer';

/**
 * Panel Card Variant for visual styling
 */
export type PanelCardVariant = 'hero' | 'card' | 'flat' | 'sidebar' | 'none';

/**
 * Panel Configuration - defines a single dashboard panel
 */
export interface PanelConfig {
  /** Unique identifier for the panel */
  id: string;

  /** Display name for the panel */
  name: string;

  /** Optional description for admin/config UI */
  description?: string;

  /** Priority level determines layout position */
  priority: PanelPriority;

  /** Size in grid layout */
  size?: PanelSize;

  /** Layout zone - where this panel appears in the dashboard structure */
  layoutZone?: LayoutZone;

  /** Card variant - visual styling of the panel container */
  cardVariant?: PanelCardVariant;

  /** Minimum height constraint (e.g. '60vh', '400px') */
  minHeight?: string;

  /** Maximum height constraint (e.g. '80vh', '600px') */
  maxHeight?: string;

  /** Order within priority group (lower numbers render first) */
  order: number;

  /** Whether panel is collapsible */
  collapsible?: boolean;

  /** Default collapsed state (only applies if collapsible) */
  defaultCollapsed?: boolean;

  /** Whether to show loading skeleton */
  showSkeleton?: boolean;

  /** Minimum role required to view panel */
  requiredRole?: 'user' | 'admin';

  /** Custom className for styling */
  className?: string;
}

/**
 * Panel Component Props - props passed to each panel component
 */
export interface PanelProps<T = any> {
  /** Panel configuration */
  config: PanelConfig;

  /** Optional data passed to the panel */
  data?: T;

  /** User context */
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Panel Definition - combines config with component
 */
export interface PanelDefinition<T = any> {
  /** Panel configuration */
  config: PanelConfig;

  /** React component to render */
  component: ComponentType<PanelProps<T>>;

  /** Optional skeleton component for loading state */
  skeleton?: ComponentType;

  /** Optional data fetcher function (for server components) */
  fetchData?: () => Promise<T>;
}

/**
 * Dashboard Layout Configuration
 */
export interface DashboardLayoutConfig {
  /** Layout variant */
  variant: 'default' | 'compact' | 'wide';

  /** Whether to use grid layout (true) or stack (false) */
  useGrid?: boolean;

  /** Custom grid columns (CSS grid template) */
  gridTemplate?: string;

  /** Gap between panels */
  gap?: 'sm' | 'md' | 'lg';
}

/**
 * Dashboard Configuration - the main config object
 */
export interface DashboardConfig {
  /** All registered panels */
  panels: PanelDefinition[];

  /** Layout configuration */
  layout?: DashboardLayoutConfig;

  /** Optional header component */
  header?: ComponentType;

  /** Optional footer component */
  footer?: ComponentType;
}
