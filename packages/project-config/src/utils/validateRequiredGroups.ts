import type { SubmissionFormConfig } from "../schemas/projectConfig";

export interface FieldValue {
  fieldName: string;
  value: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Checks if a value is considered "filled" (non-empty)
 */
function hasValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Gets a human-readable label for a field name
 */
function getFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    audioFile: "Audio file",
    coverImage: "Cover image",
    lyrics: "Lyrics",
    coolThingsLearned: "Cool things learned",
    toolsUsed: "Tools used",
    happyAccidents: "Happy accidents",
    didntWork: "What didn't work",
  };
  return labels[fieldName] || fieldName;
}

/**
 * Validates that at least one field from each required group has a value.
 *
 * Required groups allow boolean OR logic for field requirements.
 * For example, if both 'audioFile' and 'lyrics' have requiredGroup: "submission-content",
 * then at least one of them must be provided.
 *
 * @param config - The submission form configuration
 * @param fieldValues - Array of field names and their current values
 * @returns Validation result with any errors
 */
export function validateRequiredGroups(
  config: SubmissionFormConfig,
  fieldValues: FieldValue[]
): ValidationResult {
  const errors: string[] = [];

  // Group fields by their requiredGroup
  const groups = new Map<string, { fieldName: string; hasValue: boolean }[]>();

  for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
    if (fieldConfig.requiredGroup) {
      const groupName = fieldConfig.requiredGroup;
      if (!groups.has(groupName)) {
        groups.set(groupName, []);
      }

      const fieldValue = fieldValues.find((f) => f.fieldName === fieldName);
      const fieldHasValue = hasValue(fieldValue?.value);

      groups.get(groupName)!.push({ fieldName, hasValue: fieldHasValue });
    }
  }

  // Check each group has at least one field with a value
  for (const [_groupName, fields] of groups) {
    const anyHasValue = fields.some((f) => f.hasValue);
    if (!anyHasValue) {
      const fieldLabels = fields.map((f) => getFieldLabel(f.fieldName));
      if (fieldLabels.length === 1) {
        errors.push(`${fieldLabels[0]} is required`);
      } else if (fieldLabels.length === 2) {
        errors.push(`Please provide either ${fieldLabels[0]} or ${fieldLabels[1]}`);
      } else {
        const lastLabel = fieldLabels.pop();
        errors.push(`Please provide at least one of: ${fieldLabels.join(", ")}, or ${lastLabel}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates individual required fields (non-group required fields)
 *
 * @param config - The submission form configuration
 * @param fieldValues - Array of field names and their current values
 * @returns Validation result with any errors
 */
export function validateRequiredFields(
  config: SubmissionFormConfig,
  fieldValues: FieldValue[]
): ValidationResult {
  const errors: string[] = [];

  for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
    // Skip fields that are not enabled or are part of a required group
    if (!fieldConfig.enabled || fieldConfig.requiredGroup) {
      continue;
    }

    if (fieldConfig.required) {
      const fieldValue = fieldValues.find((f) => f.fieldName === fieldName);
      if (!hasValue(fieldValue?.value)) {
        const label = fieldConfig.label || getFieldLabel(fieldName);
        errors.push(`${label} is required`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates all submission form requirements (both required fields and required groups)
 *
 * @param config - The submission form configuration
 * @param fieldValues - Array of field names and their current values
 * @returns Combined validation result
 */
export function validateSubmissionForm(
  config: SubmissionFormConfig,
  fieldValues: FieldValue[]
): ValidationResult {
  const requiredFieldsResult = validateRequiredFields(config, fieldValues);
  const requiredGroupsResult = validateRequiredGroups(config, fieldValues);

  return {
    valid: requiredFieldsResult.valid && requiredGroupsResult.valid,
    errors: [...requiredFieldsResult.errors, ...requiredGroupsResult.errors],
  };
}
