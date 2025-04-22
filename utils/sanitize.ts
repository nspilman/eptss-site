/**
 * Simple HTML sanitization utility to prevent XSS attacks
 * For production use, consider using a more robust library like DOMPurify
 */

/**
 * Sanitizes a string by escaping HTML special characters
 * @param input The string to sanitize
 * @returns Sanitized string with HTML entities escaped
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sanitizes an object's string properties recursively
 * @param obj The object to sanitize
 * @returns A new object with sanitized string properties
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeHtml(obj) as unknown as T;
  }
  
  if (typeof obj !== 'object') {
    return obj;
  }
  
  // Create a new object of the same type as the input
  const result = Array.isArray(obj) ? [] as unknown as T : {} as T;
  
  // Handle object properties
  if (obj && typeof obj === 'object') {
    Object.keys(obj as object).forEach(key => {
      const typedKey = key as keyof T;
      const value = (obj as any)[key];
      (result as any)[key] = sanitizeObject(value);
    });
  }
  
  return result;
}
