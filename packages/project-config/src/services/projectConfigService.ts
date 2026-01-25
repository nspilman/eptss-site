"use server";

import { db, projects, eq } from "@eptss/db";
import { isValidProjectSlug, getProjectIdFromSlug, type ProjectSlug } from "@eptss/core";
import {
  ProjectConfig,
  FeatureFlags,
  UIConfig,
  BusinessRules,
  Automation,
  EmailConfig,
  PageContent,
  FAQContent,
  SEOMetadata,
  HowItWorks,
  RoundInfoLabels,
  SubmissionsGallery,
  SubmissionFormConfig,
  safeParseProjectConfig,
  getDefaultProjectConfig,
} from "../schemas/projectConfig";

// Simple in-memory cache with TTL
const configCache = new Map<string, { config: ProjectConfig; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Clear config cache for a specific project or all projects
 */
export async function clearProjectConfigCache(projectId?: string): Promise<void> {
  if (projectId) {
    configCache.delete(projectId);
  } else {
    configCache.clear();
  }
}

/**
 * Get project configuration by project ID
 */
async function getProjectConfigById(projectId: string): Promise<ProjectConfig> {
  // Check cache first
  const cached = configCache.get(projectId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.config;
  }

  // Fetch from database
  const result = await db
    .select({ config: projects.config })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!result.length) {
    console.warn(`Project not found: ${projectId}, using defaults`);
    return getDefaultProjectConfig();
  }

  // Parse and validate config
  const parsedConfig = safeParseProjectConfig(result[0].config);

  // Cache the result
  configCache.set(projectId, {
    config: parsedConfig,
    timestamp: Date.now(),
  });

  return parsedConfig;
}

/**
 * Get project configuration by slug
 */
export async function getProjectConfig(slug: ProjectSlug): Promise<ProjectConfig> {
  if (!isValidProjectSlug(slug)) {
    console.warn(`Invalid project slug: ${slug}, using defaults`);
    return getDefaultProjectConfig();
  }

  const projectId = getProjectIdFromSlug(slug);
  return getProjectConfigById(projectId);
}

/**
 * Get feature flags for a project
 */
export async function getProjectFeatures(slug: ProjectSlug): Promise<FeatureFlags> {
  const config = await getProjectConfig(slug);
  return config.features;
}

/**
 * Check if a specific feature is enabled for a project
 */
export async function isFeatureEnabled(
  slug: ProjectSlug,
  feature: keyof FeatureFlags
): Promise<boolean> {
  const features = await getProjectFeatures(slug);
  return features[feature] ?? false;
}

/**
 * Get UI configuration for a project
 */
export async function getProjectUIConfig(slug: ProjectSlug): Promise<UIConfig> {
  const config = await getProjectConfig(slug);
  return config.ui;
}

/**
 * Get business rules for a project
 */
export async function getProjectBusinessRules(slug: ProjectSlug): Promise<BusinessRules> {
  const config = await getProjectConfig(slug);
  return config.businessRules;
}

/**
 * Get terminology for a project
 */
export async function getProjectTerminology(slug: ProjectSlug) {
  const config = await getProjectConfig(slug);
  return config.terminology;
}

/**
 * Get automation configuration for a project
 */
export async function getProjectAutomation(slug: ProjectSlug): Promise<Automation> {
  const config = await getProjectConfig(slug);
  return config.automation;
}

/**
 * Get email configuration for a project
 */
export async function getProjectEmailConfig(slug: ProjectSlug): Promise<EmailConfig> {
  const config = await getProjectConfig(slug);
  return config.email;
}

/**
 * Get page content for a project
 */
export async function getProjectPageContent(slug: ProjectSlug): Promise<PageContent> {
  const config = await getProjectConfig(slug);
  return config.content.pages;
}

/**
 * Get FAQ content for a project
 */
export async function getProjectFAQContent(slug: ProjectSlug): Promise<FAQContent> {
  const config = await getProjectConfig(slug);
  return config.content.faq;
}

/**
 * Get content for a specific page
 */
export async function getPageContent<K extends keyof PageContent>(
  slug: ProjectSlug,
  page: K
): Promise<PageContent[K]> {
  const pageContent = await getProjectPageContent(slug);
  return pageContent[page];
}

/**
 * Get project metadata
 */
export async function getProjectMetadata(slug: ProjectSlug) {
  const config = await getProjectConfig(slug);
  return config.metadata;
}

/**
 * Get SEO metadata for a project
 */
export async function getProjectSEOMetadata(slug: ProjectSlug): Promise<SEOMetadata> {
  const config = await getProjectConfig(slug);
  return config.seo;
}

/**
 * Get How It Works content for a project landing page
 */
export async function getHowItWorksContent(slug: ProjectSlug): Promise<HowItWorks> {
  const config = await getProjectConfig(slug);
  return config.content.pages.home.howItWorks;
}

/**
 * Get Round Info labels for a project
 */
export async function getRoundInfoLabels(slug: ProjectSlug): Promise<RoundInfoLabels> {
  const config = await getProjectConfig(slug);
  return config.content.pages.home.roundInfo;
}

/**
 * Get Submissions Gallery content for a project
 */
export async function getSubmissionsGalleryContent(slug: ProjectSlug): Promise<SubmissionsGallery> {
  const config = await getProjectConfig(slug);
  return config.content.pages.home.submissionsGallery;
}

/**
 * Get submission form configuration for a project
 */
export async function getSubmissionFormConfig(slug: ProjectSlug): Promise<SubmissionFormConfig> {
  const config = await getProjectConfig(slug);
  return config.submissionForm;
}

/**
 * Update project configuration (admin function)
 * Note: This doesn't validate permissions - that should be done at the route/action level
 */
export async function updateProjectConfig(
  slug: ProjectSlug,
  config: Partial<ProjectConfig>
): Promise<void> {
  if (!isValidProjectSlug(slug)) {
    throw new Error(`Invalid project slug: ${slug}`);
  }

  const projectId = getProjectIdFromSlug(slug);

  // Get current config
  const currentConfig = await getProjectConfigById(projectId);

  // Merge with new config
  const updatedConfig = {
    ...currentConfig,
    ...config,
    features: { ...currentConfig.features, ...config.features },
    ui: { ...currentConfig.ui, ...config.ui },
    businessRules: { ...currentConfig.businessRules, ...config.businessRules },
    terminology: { ...currentConfig.terminology, ...config.terminology },
    email: { ...currentConfig.email, ...config.email },
    submissionForm: {
      ...currentConfig.submissionForm,
      ...config.submissionForm,
      fields: {
        ...currentConfig.submissionForm?.fields,
        ...config.submissionForm?.fields,
      },
    },
    content: {
      pages: { ...currentConfig.content.pages, ...config.content?.pages },
      faq: { ...currentConfig.content.faq, ...config.content?.faq },
    },
  };

  // Validate the merged config
  const validatedConfig = safeParseProjectConfig(updatedConfig);

  // Update in database
  await db
    .update(projects)
    .set({
      config: validatedConfig as any, // JSONB type
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));

  // Clear cache
  clearProjectConfigCache(projectId);
}
