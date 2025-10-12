import { z } from "zod";

/**
 * Extract and validate FormData against a Zod schema
 * 
 * @example
 * const result = validateFormData(formData, signupSchema);
 * if (!result.success) {
 *   return { status: 'Error', message: result.error };
 * }
 * // result.data is now type-safe!
 */
export function validateFormData<T extends z.ZodTypeAny>(
  formData: FormData,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const raw: Record<string, any> = {};

  // Extract all form fields
  for (const [key, value] of formData.entries()) {
    // Handle multiple values for same key (e.g., checkboxes)
    if (raw[key]) {
      raw[key] = Array.isArray(raw[key]) ? [...raw[key], value] : [raw[key], value];
    } else {
      raw[key] = value;
    }
  }

  // Convert numeric fields - Zod will coerce if needed
  // But FormData always returns strings, so we need to help it
  Object.keys(raw).forEach((key) => {
    if (key.includes("Id") || key.includes("roundId")) {
      const num = Number(raw[key]);
      if (!isNaN(num)) raw[key] = num;
    }
  });

  const result = schema.safeParse(raw);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    return { success: false, error: errorMessages };
  }

  return { success: true, data: result.data };
}

/**
 * Format Zod errors into a human-readable string
 */
export function formatZodError(error: z.ZodError): string {
  return error.errors
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
}
