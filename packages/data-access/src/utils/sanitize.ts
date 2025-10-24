/**
 * Robust HTML sanitization utility to prevent XSS attacks
 * Uses DOMPurify for comprehensive protection against XSS vulnerabilities
 */
import DOMPurify from 'dompurify';

// Default maximum recursion depth to prevent stack overflows
const DEFAULT_MAX_DEPTH = 20;

/**
 * Sanitizes a string using DOMPurify to prevent XSS attacks
 * @param input The string to sanitize
 * @returns Sanitized string with HTML stripped/sanitized
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  // Use DOMPurify for robust sanitization
  // This removes all potentially dangerous HTML instead of just escaping it
  return DOMPurify.sanitize(input, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [], // Strip all HTML tags by default
    ALLOWED_ATTR: [] // Strip all attributes
  });
}

/**
 * Sanitizes an object's string properties recursively with depth protection
 * @param obj The object to sanitize
 * @param maxDepth Maximum recursion depth (default: 20)
 * @param currentDepth Current recursion depth (for internal use)
 * @returns A new object with sanitized string properties
 */
export function sanitizeObject<T>(obj: T, maxDepth = DEFAULT_MAX_DEPTH, currentDepth = 0): T {
  // Return early if we've reached the maximum depth or if obj is null/undefined
  if (currentDepth >= maxDepth || !obj) {
    return obj;
  }
  
  // Handle string values
  if (typeof obj === 'string') {
    return sanitizeHtml(obj) as unknown as T;
  }
  
  // Return early for non-objects
  if (typeof obj !== 'object') {
    return obj;
  }
  
  // Create a new object of the same type as the input
  const result = Array.isArray(obj) ? [] as unknown as T : {} as T;
  
  // Process object properties with depth tracking
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const typedKey = key as keyof T;
      (result as any)[typedKey] = sanitizeObject((obj as any)[typedKey], maxDepth, currentDepth + 1);
    }
  }
  
  return result;
}
