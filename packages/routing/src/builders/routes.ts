/**
 * Page route builders for the EPTSS application
 * All route generation logic is centralized here for type safety and maintainability
 */

import { type ProjectSlug, type RouteOptions, buildUrl } from './types';

/**
 * Main route builders organized hierarchically
 */
export const routes = {
  /**
   * Home page
   */
  home: (options?: RouteOptions) => buildUrl('/', options),

  /**
   * FAQ page
   */
  faq: (options?: RouteOptions) => buildUrl('/faq', options),

  /**
   * Privacy policy page
   */
  privacyPolicy: (options?: RouteOptions) => buildUrl('/privacy-policy', options),

  /**
   * Waitlist page
   */
  waitlist: (options?: RouteOptions) => buildUrl('/waitlist', options),

  /**
   * Feedback page
   */
  feedback: (options?: RouteOptions) => buildUrl('/feedback', options),

  /**
   * Dashboard routes
   */
  dashboard: {
    /**
     * Main dashboard (redirects to project dashboard)
     */
    root: (options?: RouteOptions) => buildUrl('/dashboard', options),

    /**
     * User profile page
     */
    profile: (options?: RouteOptions) => buildUrl('/dashboard/profile', options),
  },

  /**
   * Authentication routes
   */
  auth: {
    /**
     * Login page
     * @param redirectUrl - Optional URL to redirect to after login
     */
    login: (redirectUrl?: string, options?: RouteOptions) => {
      const query = redirectUrl ? { redirectUrl } : undefined;
      return buildUrl('/login', { ...options, query: { ...query, ...options?.query } });
    },

    /**
     * Password authentication page
     */
    password: (options?: RouteOptions) => buildUrl('/auth/password', options),

    /**
     * OAuth callback handler
     */
    callback: (options?: RouteOptions) => buildUrl('/auth/callback', options),

    /**
     * Google OAuth callback
     */
    googleCallback: (options?: RouteOptions) => buildUrl('/auth/google/callback', options),
  },

  /**
   * Project routes (all project-scoped pages)
   */
  projects: {
    /**
     * Projects list page
     */
    list: (options?: RouteOptions) => buildUrl('/projects', options),

    /**
     * Project-specific dashboard
     */
    dashboard: (projectSlug: ProjectSlug, options?: RouteOptions) =>
      buildUrl(`/projects/${projectSlug}/dashboard`, options),

    /**
     * Sign up routes
     */
    signUp: {
      /**
       * General sign up page
       */
      root: (projectSlug: ProjectSlug, options?: RouteOptions) =>
        buildUrl(`/projects/${projectSlug}/sign-up`, options),

      /**
       * Round-specific sign up page
       */
      round: (projectSlug: ProjectSlug, roundSlug: string, options?: RouteOptions) =>
        buildUrl(`/projects/${projectSlug}/sign-up/${roundSlug}`, options),
    },

    /**
     * Submission routes
     */
    submit: {
      /**
       * General submit page
       */
      root: (projectSlug: ProjectSlug, options?: RouteOptions) =>
        buildUrl(`/projects/${projectSlug}/submit`, options),

      /**
       * Round-specific submit page
       */
      round: (projectSlug: ProjectSlug, roundId: string, options?: RouteOptions) =>
        buildUrl(`/projects/${projectSlug}/submit/${roundId}`, options),

      /**
       * Submission success page
       */
      success: (projectSlug: ProjectSlug, options?: RouteOptions) =>
        buildUrl(`/projects/${projectSlug}/submit/success`, options),
    },

    /**
     * Voting routes
     */
    voting: {
      /**
       * General voting page
       */
      root: (projectSlug: ProjectSlug, options?: RouteOptions) =>
        buildUrl(`/projects/${projectSlug}/voting`, options),

      /**
       * Round-specific voting page
       */
      round: (projectSlug: ProjectSlug, roundSlug: string, options?: RouteOptions) =>
        buildUrl(`/projects/${projectSlug}/voting/${roundSlug}`, options),
    },

    /**
     * Rounds routes
     */
    rounds: {
      /**
       * Past rounds list
       */
      list: (projectSlug: ProjectSlug, options?: RouteOptions) =>
        buildUrl(`/projects/${projectSlug}/rounds`, options),

      /**
       * Specific round details page
       */
      detail: (projectSlug: ProjectSlug, roundSlug: string, options?: RouteOptions) =>
        buildUrl(`/projects/${projectSlug}/round/${roundSlug}`, options),
    },

    /**
     * Reflections routes
     */
    reflections: {
      /**
       * Reflections list page
       */
      list: (projectSlug: ProjectSlug, options?: RouteOptions) =>
        buildUrl(`/projects/${projectSlug}/reflections`, options),

      /**
       * Individual reflection page
       */
      detail: (projectSlug: ProjectSlug, contentSlug: string, options?: RouteOptions) =>
        buildUrl(`/projects/${projectSlug}/reflections/${contentSlug}`, options),

      /**
       * Edit reflection page
       */
      edit: (projectSlug: ProjectSlug, contentSlug: string, options?: RouteOptions) =>
        buildUrl(`/projects/${projectSlug}/reflections/${contentSlug}/edit`, options),

      /**
       * Create new reflection
       */
      create: (projectSlug: ProjectSlug, roundSlug: string, options?: RouteOptions) =>
        buildUrl(`/projects/${projectSlug}/round/${roundSlug}/create-reflection`, options),
    },

    /**
     * Discussions page
     */
    discussions: (projectSlug: ProjectSlug, options?: RouteOptions) =>
      buildUrl(`/projects/${projectSlug}/discussions`, options),

    /**
     * Reporting page (past submitted songs)
     */
    reporting: (projectSlug: ProjectSlug, options?: RouteOptions) =>
      buildUrl(`/projects/${projectSlug}/reporting`, options),
  },

  /**
   * Admin routes
   */
  admin: {
    /**
     * Admin dashboard
     */
    root: (options?: RouteOptions) => buildUrl('/admin', options),

    /**
     * Admin tools page
     */
    tools: (options?: RouteOptions) => buildUrl('/admin/tools', options),

    /**
     * Projects management
     */
    projects: (options?: RouteOptions) => buildUrl('/admin/projects', options),

    /**
     * Rounds management
     */
    rounds: {
      /**
       * Rounds list
       */
      list: (options?: RouteOptions) => buildUrl('/admin/rounds', options),

      /**
       * Specific round management
       */
      detail: (roundSlug: string, options?: RouteOptions) =>
        buildUrl(`/admin/rounds/${roundSlug}`, options),
    },

    /**
     * Notifications management
     */
    notifications: (options?: RouteOptions) => buildUrl('/admin/notifications', options),
  },

  /**
   * Legacy/backward compatibility routes
   * These exist at the root level but may redirect to project-scoped versions
   */
  legacy: {
    /**
     * Legacy rounds page (redirects to project-scoped)
     */
    rounds: (options?: RouteOptions) => buildUrl('/rounds', options),

    /**
     * Legacy reporting page (redirects to project-scoped)
     */
    reporting: (options?: RouteOptions) => buildUrl('/reporting', options),

    /**
     * Legacy reflection detail (redirects to project-scoped)
     */
    reflection: (contentSlug: string, options?: RouteOptions) =>
      buildUrl(`/reflections/${contentSlug}`, options),
  },
} as const;

/**
 * Type helper to extract all possible route paths
 */
export type RoutePath = ReturnType<typeof routes[keyof typeof routes] extends (...args: any[]) => any
  ? typeof routes[keyof typeof routes]
  : any>;
