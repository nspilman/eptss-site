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
  ActionPanelSkeleton,
  ProfileSetupPanel,
  ProfileSetupSkeleton,
} from '@eptss/dashboard/panels';

import { ActionPanelWrapper } from './ActionPanelWrapper';
import { RoundParticipantsPanelWrapper, RoundParticipantsPanelSkeleton } from './RoundParticipantsPanelWrapper';

/**
 * Main dashboard configuration
 */
export const eptssDeboardConfig: DashboardConfig = {
  panels: [
    // ============================================
    // PROFILE SETUP PANEL - Shows first when user hasn't set display name
    // ============================================
    createPanel(
      definePanelConfig('profileSetup', {
        name: 'Complete Your Profile',
        description: 'Set up your display name and bio',
        priority: 'primary',
        order: 0,
        showSkeleton: true,
      }),
      ProfileSetupPanel,
      { skeleton: ProfileSetupSkeleton }
    ),

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
    // ACTION PANEL - Main CTA + Phase Status + Reflections (unified command center)
    // ============================================
    createPanel(
      definePanelConfig('action', {
        name: 'Your Next Action',
        description: 'Shows primary action, phase status, countdown, progress, and reflections',
        priority: 'primary',
        order: 2,
        showSkeleton: true,
      }),
      ActionPanelWrapper,
      { skeleton: ActionPanelSkeleton }
    ),

    // ============================================
    // ROUND PARTICIPANTS - Community engagement
    // ============================================
    createPanel(
      definePanelConfig('participants', {
        name: 'Round Participants',
        description: 'Shows other people signed up for this round',
        priority: 'primary',
        order: 3,
        showSkeleton: true,
      }),
      RoundParticipantsPanelWrapper,
      { skeleton: RoundParticipantsPanelSkeleton }
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
