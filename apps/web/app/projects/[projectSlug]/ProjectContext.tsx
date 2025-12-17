"use client";

import { createContext, useContext, ReactNode } from 'react';

/**
 * Route parameters context value
 * Provides access to URL-derived parameters throughout the component tree
 */
interface RouteParamsContextValue {
  projectSlug: string;
  projectId: string;
  roundSlug?: string;
}

const RouteParamsContext = createContext<RouteParamsContextValue | null>(null);

/**
 * ProjectProvider - provides project-level route parameters
 * Used at the project layout level to make projectId and projectSlug available
 */
export function ProjectProvider({
  children,
  projectSlug,
  projectId
}: {
  children: ReactNode;
  projectSlug: string;
  projectId: string;
}) {
  return (
    <RouteParamsContext.Provider value={{ projectSlug, projectId }}>
      {children}
    </RouteParamsContext.Provider>
  );
}

/**
 * RoundParamsProvider - extends project context with round-specific parameters
 * Used on round-specific pages to add roundSlug to the context
 */
export function RoundParamsProvider({
  children,
  roundSlug
}: {
  children: ReactNode;
  roundSlug: string;
}) {
  const projectContext = useContext(RouteParamsContext);

  if (!projectContext) {
    throw new Error('RoundParamsProvider must be used within a ProjectProvider');
  }

  return (
    <RouteParamsContext.Provider value={{ ...projectContext, roundSlug }}>
      {children}
    </RouteParamsContext.Provider>
  );
}

/**
 * useRouteParams - access route parameters from anywhere in the component tree
 * Returns projectId, projectSlug, and optionally roundSlug (on round-specific pages)
 */
export function useRouteParams() {
  const context = useContext(RouteParamsContext);
  if (!context) {
    throw new Error('useRouteParams must be used within a ProjectProvider');
  }
  return context;
}

/**
 * useProject - backward-compatible alias for useRouteParams
 * @deprecated Use useRouteParams instead for clarity
 */
export function useProject() {
  return useRouteParams();
}
