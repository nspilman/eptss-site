/**
 * Shared utilities for user display names and profile information
 */

export interface UserDisplayData {
  publicDisplayName?: string | null;
  username?: string | null;
  email?: string;
}

/**
 * Get the display name for a user with fallback chain:
 * publicDisplayName -> username -> email username -> fallback
 *
 * @param user - User data with display name, username, and optionally email
 * @param fallback - Fallback value if nothing else is available (default: "Someone")
 * @returns The display name to show
 *
 * @example
 * ```ts
 * getDisplayName({ publicDisplayName: "John Doe" }) // "John Doe"
 * getDisplayName({ username: "johndoe" }) // "johndoe"
 * getDisplayName({ email: "john@example.com" }) // "john"
 * getDisplayName({}, "Anonymous") // "Anonymous"
 * ```
 */
export function getDisplayName(
  user: UserDisplayData,
  fallback: string = "Someone"
): string {
  if (user.publicDisplayName) {
    return user.publicDisplayName;
  }

  if (user.username) {
    return user.username;
  }

  if (user.email) {
    return user.email.split('@')[0];
  }

  return fallback;
}

/**
 * Get initials from a display name
 * Returns first letter of first and last word, or first 2 letters if single word
 *
 * @param name - The name to get initials from
 * @returns Uppercase initials (2 characters)
 *
 * @example
 * ```ts
 * getInitials("John Doe") // "JD"
 * getInitials("John") // "JO"
 * getInitials("") // "?"
 * ```
 */
export function getInitials(name: string): string {
  if (!name || !name.trim()) {
    return "?";
  }

  const trimmedName = name.trim();
  const words = trimmedName.split(/\s+/);

  // If multiple words, use first letter of first and last word
  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }

  // Single word: use first 2 letters
  return trimmedName.slice(0, 2).toUpperCase();
}

/**
 * Validate and sanitize a string field with length constraints
 *
 * @param value - The value to validate
 * @param fieldName - Name of the field for error messages
 * @param maxLength - Maximum allowed length (default: 100)
 * @param required - Whether the field is required (default: false)
 * @returns Object with success status, trimmed value, and optional error message
 *
 * @example
 * ```ts
 * validateStringField("  John Doe  ", "name", 50)
 * // { success: true, value: "John Doe", error: null }
 *
 * validateStringField("a".repeat(200), "name", 100)
 * // { success: false, value: null, error: "Name must be less than 100 characters" }
 * ```
 */
export function validateStringField(
  value: string | null | undefined,
  fieldName: string,
  maxLength: number = 100,
  required: boolean = false
): { success: boolean; value: string | null; error: string | null } {
  const trimmedValue = value?.trim() || null;

  if (required && !trimmedValue) {
    return {
      success: false,
      value: null,
      error: `${fieldName} is required`,
    };
  }

  if (trimmedValue && trimmedValue.length > maxLength) {
    return {
      success: false,
      value: null,
      error: `${fieldName} must be less than ${maxLength} characters`,
    };
  }

  return {
    success: true,
    value: trimmedValue,
    error: null,
  };
}
