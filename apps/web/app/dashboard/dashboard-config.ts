/**
 * Dashboard Configuration for EPTSS
 *
 * This uses the modular @eptss/dashboard package.
 * To add new panels, just add them to the panels array!
 */

import {
  DashboardConfig,
  createPanel,
  definePanelConfig,
} from '@eptss/dashboard';

import {
  HeroPanel,
  HeroSkeleton,
  PhaseStatusPanel,
  PhaseStatusSkeleton,
  ActionPanel,
  ActionPanelSkeleton,
  CurrentRoundPanel,
  CurrentRoundSkeleton,
  ReflectionPanel,
  ReflectionSkeleton,
} from '@eptss/dashboard/panels';

/**
 * Main dashboard configuration
 */
export const eptssDeboardConfig: DashboardConfig = {
  panels: [
    // ============================================
    // HERO PANEL - Always at top
    // ============================================
    createPanel(
      definePanelConfig('hero', {
        name: 'Round Header',
        description: 'Displays current round number and song',
        priority: 'primary',
        order: 1,
        showSkeleton: true,
      }),
      HeroPanel,
      { skeleton: HeroSkeleton }
    ),

    // ============================================
    // PHASE STATUS - Deadline banner (right after hero)
    // ============================================
    createPanel(
      definePanelConfig('phase-status', {
        name: 'Phase Status',
        description: 'Shows current phase and time remaining',
        priority: 'primary',
        order: 2,
        showSkeleton: true,
      }),
      PhaseStatusPanel,
      { skeleton: PhaseStatusSkeleton }
    ),

    // ============================================
    // REFLECTIONS - Third position
    // ============================================
    createPanel(
      definePanelConfig('reflections', {
        name: 'My Reflections',
        description: 'User reflections and journal entries',
        priority: 'primary',
        order: 3,
        collapsible: true,
        defaultCollapsed: false,
        showSkeleton: true,
      }),
      ReflectionPanel,
      { skeleton: ReflectionSkeleton }
    ),

    // ============================================
    // PROGRESS PANEL - Status info, fourth position
    // ============================================
    createPanel(
      definePanelConfig('current-round', {
        name: 'Your Progress',
        description: 'Shows phase progress and status',
        priority: 'primary',
        order: 4,
        showSkeleton: true,
      }),
      CurrentRoundPanel,
      { skeleton: CurrentRoundSkeleton }
    ),

    // ============================================
    // ACTION PANEL - Submit cover CTA at bottom
    // ============================================
    createPanel(
      definePanelConfig('action', {
        name: 'Your Next Action',
        description: 'Shows the primary action user needs to take',
        priority: 'primary',
        order: 5,
        showSkeleton: true,
      }),
      ActionPanel,
      { skeleton: ActionPanelSkeleton }
    ),

    // ============================================
    // FUTURE PANELS
    // ============================================

    // FUTURE: Community Activity (Sidebar)
    // Uncomment when ready to implement:
    //
    // import { CommunityPanel, CommunitySkeleton } from '@eptss/dashboard/panels';
    //
    // createPanel(
    //   definePanelConfig('community', {
    //     name: 'Community Activity',
    //     description: 'Shows recent community activity and stats',
    //     priority: 'secondary',
    //     order: 1,
    //     showSkeleton: true,
    //   }),
    //   CommunityPanel,
    //   { skeleton: CommunitySkeleton }
    // ),

    // FUTURE: User Streak Counter (Sidebar)
    // createPanel(
    //   definePanelConfig('streak', {
    //     name: 'Your Streak',
    //     description: 'Shows consecutive participation streak',
    //     priority: 'secondary',
    //     order: 2,
    //   }),
    //   StreakPanel,
    //   { skeleton: StreakSkeleton }
    // ),

    // FUTURE: Next Round Preview (Below fold)
    // createPanel(
    //   definePanelConfig('next-round', {
    //     name: 'Next Round',
    //     description: 'Preview and early signup for next round',
    //     priority: 'tertiary',
    //     order: 2,
    //   }),
    //   NextRoundPanel,
    //   { skeleton: NextRoundSkeleton }
    // ),
  ],

  // Layout configuration
  layout: {
    variant: 'default', // 'default' | 'compact' | 'wide'
    useGrid: true, // true = grid layout, false = vertical stack
    gap: 'md', // 'sm' | 'md' | 'lg'
  },
};
