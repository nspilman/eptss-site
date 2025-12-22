/**
 * Type definitions for routing parameters
 */

/**
 * Valid project slugs in the application
 */
export type ProjectSlug = 'cover' | string;

/**
 * Options for route building
 */
export interface RouteOptions {
  /** Query parameters to append to the route */
  query?: Record<string, string | number | boolean | undefined>;
  /** Fragment/hash to append to the route */
  hash?: string;
}

/**
 * Helper to build query string from parameters
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params).filter(([_, value]) => value !== undefined);
  if (entries.length === 0) return '';

  const searchParams = new URLSearchParams();
  entries.forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  return `?${searchParams.toString()}`;
}

/**
 * Helper to build full URL with query and hash
 */
export function buildUrl(path: string, options?: RouteOptions): string {
  let url = path;

  if (options?.query) {
    url += buildQueryString(options.query);
  }

  if (options?.hash) {
    url += `#${options.hash}`;
  }

  return url;
}
