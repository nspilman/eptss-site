/**
 * Shared Zod preprocessing helpers
 * Reusable schema transformations for consistent validation across the codebase
 */

import { z } from "zod";

/**
 * Preprocessor for optional positive numbers
 * Handles FormData string inputs and converts to number or undefined
 *
 * Use case: Form fields that should be positive numbers but may be empty/undefined
 * Example: audioDuration, audioFileSize, fileSize
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   audioDuration: optionalPositiveNumber,
 *   audioFileSize: optionalPositiveNumber,
 * });
 * ```
 */
export const optionalPositiveNumber = z.preprocess(
  (val) => {
    // Handle null, undefined, or empty string
    if (val === undefined || val === "" || val === null) {
      return undefined;
    }

    // Convert to number
    const num = Number(val);

    // Return undefined if conversion failed
    return isNaN(num) ? undefined : num;
  },
  z.number().positive().optional()
);

/**
 * Preprocessor for optional non-negative numbers (includes 0)
 * Handles FormData string inputs and converts to number or undefined
 *
 * Use case: Counts, indexes, or values where 0 is valid
 * Example: voteCount, playCount, index
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   voteCount: optionalNonNegativeNumber,
 *   playCount: optionalNonNegativeNumber,
 * });
 * ```
 */
export const optionalNonNegativeNumber = z.preprocess(
  (val) => {
    if (val === undefined || val === "" || val === null) {
      return undefined;
    }

    const num = Number(val);
    return isNaN(num) ? undefined : num;
  },
  z.number().nonnegative().optional()
);

/**
 * Preprocessor for optional integers
 * Handles FormData string inputs and converts to integer or undefined
 *
 * Use case: IDs, counts, or values that must be whole numbers
 * Example: userId, roundId, submissionCount
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   userId: optionalInteger,
 *   roundId: optionalInteger,
 * });
 * ```
 */
export const optionalInteger = z.preprocess(
  (val) => {
    if (val === undefined || val === "" || val === null) {
      return undefined;
    }

    const num = Number(val);
    return isNaN(num) ? undefined : Math.floor(num);
  },
  z.number().int().optional()
);

/**
 * Preprocessor for required positive numbers
 * Handles FormData string inputs and converts to number
 * Throws validation error if value is missing or invalid
 *
 * Use case: Required numeric fields
 * Example: price, quantity, duration (when required)
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   price: requiredPositiveNumber,
 *   quantity: requiredPositiveNumber,
 * });
 * ```
 */
export const requiredPositiveNumber = z.preprocess(
  (val) => {
    if (val === undefined || val === "" || val === null) {
      // This will fail the z.number().positive() validation
      return NaN;
    }

    return Number(val);
  },
  z.number({
    required_error: "This field is required",
    invalid_type_error: "Must be a valid number",
  }).positive("Must be a positive number")
);

/**
 * Preprocessor for optional boolean values
 * Handles FormData string inputs ("true", "false", "1", "0")
 *
 * Use case: Checkboxes, toggles in forms
 * Example: isActive, enableNotifications
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   isActive: optionalBoolean,
 *   enableNotifications: optionalBoolean,
 * });
 * ```
 */
export const optionalBoolean = z.preprocess(
  (val) => {
    if (val === undefined || val === "" || val === null) {
      return undefined;
    }

    // Handle string boolean values from FormData
    if (typeof val === "string") {
      const lower = val.toLowerCase();
      if (lower === "true" || lower === "1" || lower === "on") return true;
      if (lower === "false" || lower === "0" || lower === "off") return false;
      return undefined;
    }

    // Handle actual boolean values
    return Boolean(val);
  },
  z.boolean().optional()
);

/**
 * Preprocessor for optional dates
 * Handles FormData string inputs and converts to Date or undefined
 *
 * Use case: Date fields in forms
 * Example: birthDate, startDate, endDate
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   birthDate: optionalDate,
 *   startDate: optionalDate,
 * });
 * ```
 */
export const optionalDate = z.preprocess(
  (val) => {
    if (val === undefined || val === "" || val === null) {
      return undefined;
    }

    // Handle string date values from FormData
    if (typeof val === "string") {
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date;
    }

    // Handle Date objects
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? undefined : val;
    }

    return undefined;
  },
  z.date().optional()
);

/**
 * Helper to create URL or empty string schema
 * Common pattern for optional image/file URLs
 *
 * Use case: Optional URLs that can be empty string or valid URL
 * Example: coverImageUrl, profilePictureUrl
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   coverImageUrl: urlOrEmpty(),
 *   profilePictureUrl: urlOrEmpty(),
 * });
 * ```
 */
export const urlOrEmpty = () => z.union([z.string().url(), z.literal("")]).optional();

/**
 * Helper to create trimmed string schema
 * Automatically trims whitespace from strings
 *
 * Use case: Text inputs where leading/trailing whitespace should be removed
 * Example: name, title, description
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   title: trimmedString().min(1, "Title is required"),
 *   description: trimmedString().optional(),
 * });
 * ```
 */
export const trimmedString = () =>
  z.preprocess((val) => {
    if (typeof val === "string") {
      return val.trim();
    }
    return val;
  }, z.string());

/**
 * Helper to create non-empty trimmed string schema
 * Automatically trims whitespace and ensures string is not empty
 *
 * Use case: Required text fields
 * Example: username, email, title
 *
 * @example
 * ```typescript
 * const schema = z.object({
 *   username: nonEmptyTrimmedString("Username is required"),
 *   title: nonEmptyTrimmedString("Title is required"),
 * });
 * ```
 */
export const nonEmptyTrimmedString = (errorMessage = "This field is required") =>
  z.preprocess((val) => {
    if (typeof val === "string") {
      return val.trim();
    }
    return val;
  }, z.string().min(1, errorMessage));
