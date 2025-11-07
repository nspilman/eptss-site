/**
 * Robust HTML sanitization utility to prevent XSS attacks
 * Uses a simple but effective approach that strips all HTML tags
 * Works in both browser and Node.js environments without heavy dependencies
 */

// Default maximum recursion depth to prevent stack overflows
const DEFAULT_MAX_DEPTH = 20;

/**
 * Sanitizes a string by stripping all HTML tags and escaping special characters
 * This is a lightweight alternative to DOMPurify that works in all environments
 * @param input The string to sanitize
 * @returns Sanitized string with HTML stripped
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  // Step 1: Remove all HTML tags using regex
  // This removes anything between < and >
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Step 2: Decode common HTML entities to prevent double-encoding
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&');

  // Step 3: Escape special characters to prevent XSS
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Step 4: Remove any remaining potentially dangerous patterns
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:/gi, '');
  // Remove vbscript: protocol
  sanitized = sanitized.replace(/vbscript:/gi, '');

  return sanitized.trim();
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
