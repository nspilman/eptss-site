/**
 * Pattern matching utilities for routes
 * Supports matching paths with dynamic segments
 */

/**
 * Convert a route pattern to a regex pattern
 * Dynamic segments are denoted with [param] or :param
 *
 * @example
 * patternToRegex('/projects/[slug]/reflections') -> /^\/projects\/[^\/]+\/reflections$/
 * patternToRegex('/projects/:slug/reflections') -> /^\/projects\/[^\/]+\/reflections$/
 */
function patternToRegex(pattern: string): RegExp {
  const regexPattern = pattern
    // Replace [param] with regex group
    .replace(/\[([^\]]+)\]/g, '([^/]+)')
    // Replace :param with regex group
    .replace(/:([^/]+)/g, '([^/]+)')
    // Escape forward slashes
    .replace(/\//g, '\\/')
    // Optional trailing slash
    .replace(/\\\/$/, '(?:\\/)?');

  return new RegExp(`^${regexPattern}$`);
}

/**
 * Check if a pathname matches a route pattern
 *
 * @example
 * matchesPattern('/projects/cover/reflections', '/projects/[slug]/reflections') -> true
 * matchesPattern('/projects/cover/reflections', '/projects/:slug/reflections') -> true
 * matchesPattern('/projects/cover', '/projects/[slug]/reflections') -> false
 */
export function matchesPattern(pathname: string, pattern: string): boolean {
  const regex = patternToRegex(pattern);
  return regex.test(pathname);
}

/**
 * Extract parameters from a pathname based on a pattern
 *
 * @example
 * extractParams('/projects/cover/reflections', '/projects/[slug]/reflections')
 * -> { slug: 'cover' }
 */
export function extractParams(
  pathname: string,
  pattern: string
): Record<string, string> | null {
  // Extract parameter names from pattern
  const paramNames: string[] = [];
  const bracketParams = pattern.match(/\[([^\]]+)\]/g);
  if (bracketParams) {
    paramNames.push(...bracketParams.map(p => p.slice(1, -1)));
  }

  const colonParams = pattern.match(/:([^/]+)/g);
  if (colonParams) {
    paramNames.push(...colonParams.map(p => p.slice(1)));
  }

  // Convert pattern to regex with capturing groups
  const regexPattern = pattern
    .replace(/\[([^\]]+)\]/g, '([^/]+)')
    .replace(/:([^/]+)/g, '([^/]+)')
    .replace(/\//g, '\\/')
    .replace(/\\\/$/, '(?:\\/)?');

  const regex = new RegExp(`^${regexPattern}$`);
  const match = pathname.match(regex);

  if (!match) return null;

  // Build params object
  const params: Record<string, string> = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1];
  });

  return params;
}
