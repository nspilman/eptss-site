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
  RoundReflectionsPanel,
  RoundReflectionsSkeleton,
  InviteFriendsPanel,
  InviteFriendsSkeleton,
} from '@eptss/dashboard/panels';

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
        layoutZone: 'header',
        cardVariant: 'card',
        showSkeleton: true,
      }),
      ProfileSetupPanel,
      { skeleton: ProfileSetupSkeleton }
    ),

    // ============================================
    // HERO PANEL - Main content (2/3 width)
    // ============================================
    createPanel(
      definePanelConfig('hero', {
        name: 'Round Header',
        description: 'Displays current round number and song',
        priority: 'primary',
        order: 1,
        layoutZone: 'main',
        cardVariant: 'hero',
        showSkeleton: true,
      }),
      HeroPanel,
      { skeleton: HeroSkeleton }
    ),


    // ============================================
    // ROUND PARTICIPANTS - Collapsible sidebar widget
    // ============================================
    createPanel(
      definePanelConfig('participants', {
        name: 'Round Participants',
        description: 'Shows other people signed up for this round (collapsible)',
        priority: 'secondary',
        order: 2,
        layoutZone: 'sidebar',
        cardVariant: 'none', // Handles its own card styling for collapse
        showSkeleton: true,
      }),
      RoundParticipantsPanelWrapper,
      { skeleton: RoundParticipantsPanelSkeleton }
    ),

    // ============================================
    // ROUND REFLECTIONS - Community reflections
    // ============================================
    createPanel(
      definePanelConfig('reflections', {
        name: 'Community Reflections',
        description: 'Public reflections from round participants',
        priority: 'tertiary',
        order: 1,
        layoutZone: 'footer',
        cardVariant: 'card',
        showSkeleton: true,
      }),
      RoundReflectionsPanel,
      { skeleton: RoundReflectionsSkeleton }
    ),

    // ============================================
    // INVITE FRIENDS - Referral invitation
    // ============================================
    createPanel(
      definePanelConfig('inviteFriends', {
        name: 'Invite Friends',
        description: 'Share EPTSS with your friends',
        priority: 'tertiary',
        order: 2,
        layoutZone: 'footer',
        cardVariant: 'card',
        showSkeleton: true,
      }),
      InviteFriendsPanel,
      { skeleton: InviteFriendsSkeleton }
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
