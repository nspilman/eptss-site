/**
 * API route builders for the EPTSS application
 * All API endpoint paths are centralized here for type safety and maintainability
 */

import { type RouteOptions, buildUrl } from './types';

/**
 * API route builders organized by domain
 */
export const api = {
  /**
   * Comments API routes
   */
  comments: {
    /**
     * Get/update/delete a specific comment
     */
    byId: (commentId: string, options?: RouteOptions) =>
      buildUrl(`/api/comments/${commentId}`, options),
  },

  /**
   * Notifications API routes
   */
  notifications: {
    /**
     * List all notifications or create new
     */
    root: (options?: RouteOptions) => buildUrl('/api/notifications', options),

    /**
     * Get/delete a specific notification
     */
    byId: (notificationId: string, options?: RouteOptions) =>
      buildUrl(`/api/notifications/${notificationId}`, options),

    /**
     * Mark notification as read
     */
    markRead: (notificationId: string, options?: RouteOptions) =>
      buildUrl(`/api/notifications/${notificationId}/read`, options),

    /**
     * Get content slug by content ID
     */
    contentSlug: (contentId: string, options?: RouteOptions) =>
      buildUrl('/api/notifications/content-slug', { ...options, query: { contentId, ...options?.query } }),
  },

  /**
   * Profile API routes
   */
  profile: {
    /**
     * Update user profile
     */
    update: (options?: RouteOptions) => buildUrl('/api/profile/update', options),

    /**
     * Update privacy settings
     */
    privacy: (options?: RouteOptions) => buildUrl('/api/profile/privacy', options),
  },

  /**
   * Rounds API routes
   */
  rounds: {
    /**
     * List all rounds
     */
    list: (options?: RouteOptions) => buildUrl('/api/rounds', options),

    /**
     * Get current round
     */
    current: (options?: RouteOptions) => buildUrl('/api/round/current', options),

    /**
     * Get round info
     */
    info: (options?: RouteOptions) => buildUrl('/api/round-info', options),
  },

  /**
   * Admin API routes
   */
  admin: {
    /**
     * Project configuration
     */
    projectConfig: (options?: RouteOptions) => buildUrl('/api/admin/project-config', options),

    /**
     * Round management
     */
    rounds: {
      /**
       * Manage specific round
       */
      byId: (roundId: string, options?: RouteOptions) =>
        buildUrl(`/api/admin/rounds/${roundId}`, options),
    },
  },

  /**
   * Authentication API routes
   */
  auth: {
    /**
     * Create new user
     */
    createUser: (options?: RouteOptions) => buildUrl('/api/auth/create-user', options),
  },

  /**
   * Cron/scheduled tasks API routes
   */
  cron: {
    /**
     * Generic cron endpoint
     */
    task: (taskName: string, options?: RouteOptions) =>
      buildUrl(`/api/cron/${taskName}`, options),
  },
} as const;
