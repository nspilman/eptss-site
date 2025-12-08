/**
 * Client-side project configuration utilities
 *
 * This provides a hybrid approach:
 * - Configuration is fetched and validated on the server
 * - Client components receive fully-typed config objects
 * - No Zod validation bundles sent to client
 */

import {
  type ProjectConfig,
  type FeatureFlags,
  type UIConfig,
  type BusinessRules,
  type EmailConfig,
  type PageContent,
  type FAQContent,
  getProjectConfig,
  getProjectFeatures,
  getProjectUIConfig,
  getProjectBusinessRules,
  getProjectEmailConfig,
  getProjectPageContent,
  getProjectFAQContent,
  getPageContent,
} from '@eptss/project-config';
import type { ProjectSlug } from '@eptss/data-access';

// ============================================================================
// SERVER-SIDE CONFIG FETCHERS
// ============================================================================

/**
 * Fetch full project config (server-side)
 * Use this in Server Components or Server Actions
 */
export async function fetchProjectConfig(slug: ProjectSlug): Promise<ProjectConfig> {
  return getProjectConfig(slug);
}

/**
 * Fetch project features (server-side)
 * Use this in Server Components or Server Actions
 */
export async function fetchProjectFeatures(slug: ProjectSlug): Promise<FeatureFlags> {
  return getProjectFeatures(slug);
}

/**
 * Fetch project UI config (server-side)
 * Use this in Server Components or Server Actions
 */
export async function fetchProjectUIConfig(slug: ProjectSlug): Promise<UIConfig> {
  return getProjectUIConfig(slug);
}

/**
 * Fetch project business rules (server-side)
 * Use this in Server Components or Server Actions
 */
export async function fetchProjectBusinessRules(slug: ProjectSlug): Promise<BusinessRules> {
  return getProjectBusinessRules(slug);
}

/**
 * Fetch project email config (server-side)
 * Use this in Server Components or Server Actions
 */
export async function fetchProjectEmailConfig(slug: ProjectSlug): Promise<EmailConfig> {
  return getProjectEmailConfig(slug);
}

/**
 * Fetch all page content (server-side)
 * Use this in Server Components or Server Actions
 */
export async function fetchProjectPageContent(slug: ProjectSlug): Promise<PageContent> {
  return getProjectPageContent(slug);
}

/**
 * Fetch FAQ content (server-side)
 * Use this in Server Components or Server Actions
 */
export async function fetchProjectFAQContent(slug: ProjectSlug): Promise<FAQContent> {
  return getProjectFAQContent(slug);
}

/**
 * Fetch content for a specific page (server-side)
 * Use this in Server Components or Server Actions
 */
export async function fetchPageContent<K extends keyof PageContent>(
  slug: ProjectSlug,
  page: K
): Promise<PageContent[K]> {
  return getPageContent(slug, page);
}

// ============================================================================
// CLIENT-SIDE HELPERS
// ============================================================================

/**
 * Client-side helper to check if a feature is enabled
 * Expects features to be passed as props from server component
 *
 * @example
 * ```tsx
 * // In Server Component:
 * const features = await fetchProjectFeatures('cover');
 * return <ClientComponent features={features} />;
 *
 * // In Client Component:
 * if (isFeatureEnabled(features, 'enableVoting')) {
 *   // Show voting UI
 * }
 * ```
 */
export function isFeatureEnabled(
  features: FeatureFlags,
  feature: keyof FeatureFlags
): boolean {
  return features[feature] ?? false;
}

/**
 * Client-side helper to get page content
 * Expects page content to be passed as props from server component
 *
 * @example
 * ```tsx
 * // In Server Component:
 * const pageContent = await fetchProjectPageContent('cover');
 * return <ClientComponent pageContent={pageContent} />;
 *
 * // In Client Component:
 * const homeContent = getPageContentClient(pageContent, 'home');
 * ```
 */
export function getPageContentClient<K extends keyof PageContent>(
  pageContent: PageContent,
  page: K
): PageContent[K] {
  return pageContent[page];
}

// ============================================================================
// TYPE RE-EXPORTS FOR CONVENIENCE
// ============================================================================

export type {
  ProjectConfig,
  FeatureFlags,
  UIConfig,
  BusinessRules,
  EmailConfig,
  PageContent,
  FAQContent,
  ProjectSlug,
};
