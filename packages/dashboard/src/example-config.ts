/**
 * Example Dashboard Configuration
 *
 * This file demonstrates how to configure the dashboard with panels.
 * Copy this pattern to your app to create your own dashboard configuration.
 */

import { DashboardConfig } from './types';
import { createPanel, definePanelConfig } from './utils/panelRegistry';
import {
  HeroPanel,
  HeroSkeleton,
  ActionPanel,
  ActionPanelSkeleton,
  CurrentRoundPanel,
  CurrentRoundSkeleton,
  ReflectionPanel,
  ReflectionSkeleton,
} from './panels';

/**
 * Example: Basic dashboard with hero, action, current round, and reflections
 */
export const basicDashboardConfig: DashboardConfig = {
  panels: [
    // Hero Panel - Always shows at top
    createPanel(
      definePanelConfig('hero', {
        name: 'Round Header',
        priority: 'primary',
        order: 1,
        showSkeleton: true,
      }),
      HeroPanel,
      { skeleton: HeroSkeleton }
    ),

    // Action Panel - Primary CTA (NEW!)
    // Shows the main action user needs to take
    createPanel(
      definePanelConfig('action', {
        name: 'Your Next Action',
        priority: 'primary',
        order: 2,
        showSkeleton: true,
      }),
      ActionPanel,
      { skeleton: ActionPanelSkeleton }
    ),

    // Current Round Panel - Status info (no CTA)
    createPanel(
      definePanelConfig('current-round', {
        name: 'Your Progress',
        priority: 'primary',
        order: 3,
        showSkeleton: true,
      }),
      CurrentRoundPanel,
      { skeleton: CurrentRoundSkeleton }
    ),

    // Reflection Panel - Collapsible, below fold
    createPanel(
      definePanelConfig('reflections', {
        name: 'My Reflections',
        priority: 'tertiary',
        order: 1,
        collapsible: true,
        defaultCollapsed: false,
        showSkeleton: true,
      }),
      ReflectionPanel,
      { skeleton: ReflectionSkeleton }
    ),
  ],

  layout: {
    variant: 'default',
    useGrid: true,
    gap: 'md',
  },
};

/**
 * Example: Extended dashboard with future community panel placeholder
 *
 * This shows how to add a panel that doesn't exist yet - just comment it out
 * until you're ready to implement it!
 */
export const extendedDashboardConfig: DashboardConfig = {
  panels: [
    // Hero Panel
    createPanel(
      definePanelConfig('hero', {
        name: 'Round Header',
        priority: 'primary',
        order: 1,
      }),
      HeroPanel,
      { skeleton: HeroSkeleton }
    ),

    // Current Round Panel
    createPanel(
      definePanelConfig('current-round', {
        name: 'Current Round Progress',
        priority: 'primary',
        order: 2,
      }),
      CurrentRoundPanel,
      { skeleton: CurrentRoundSkeleton }
    ),

    // Community Panel - FUTURE: Uncomment when ready to implement
    // createPanel(
    //   definePanelConfig('community', {
    //     name: 'Community Activity',
    //     priority: 'secondary',
    //     order: 1,
    //   }),
    //   CommunityPanel,
    //   { skeleton: CommunitySkeleton }
    // ),

    // Reflection Panel
    createPanel(
      definePanelConfig('reflections', {
        name: 'My Reflections',
        priority: 'tertiary',
        order: 1,
        collapsible: true,
        defaultCollapsed: false,
      }),
      ReflectionPanel,
      { skeleton: ReflectionSkeleton }
    ),
  ],

  layout: {
    variant: 'default',
    useGrid: true,
    gap: 'md',
  },
};

/**
 * Example: Compact dashboard (no tertiary panels)
 */
export const compactDashboardConfig: DashboardConfig = {
  panels: [
    createPanel(
      definePanelConfig('hero', {
        priority: 'primary',
        order: 1,
      }),
      HeroPanel,
      { skeleton: HeroSkeleton }
    ),

    createPanel(
      definePanelConfig('current-round', {
        priority: 'primary',
        order: 2,
      }),
      CurrentRoundPanel,
      { skeleton: CurrentRoundSkeleton }
    ),
  ],

  layout: {
    variant: 'compact',
    useGrid: false, // Stack layout for simplicity
    gap: 'sm',
  },
};
