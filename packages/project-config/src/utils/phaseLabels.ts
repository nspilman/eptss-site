import { ProjectSlug } from "@eptss/data-access";
import { getProjectTerminology } from "../services/projectConfigService";

/**
 * Phase identifier used in the database and code
 */
export type PhaseKey = "signups" | "voting" | "covering" | "celebration";

/**
 * Get user-facing phase name from project configuration
 *
 * @param projectSlug - The project slug
 * @param phase - The phase key (e.g., "covering")
 * @returns The configured phase name (e.g., "Covering Phase" or "Recording Phase")
 *
 * @example
 * ```typescript
 * const phaseName = await getPhaseLabel("cover", "covering");
 * // Returns: "Covering Phase" or custom value from config
 * ```
 */
export async function getPhaseLabel(
  projectSlug: ProjectSlug,
  phase: PhaseKey
): Promise<string> {
  const terminology = await getProjectTerminology(projectSlug);
  return terminology.phases[phase];
}

/**
 * Get user-facing short phase name from project configuration
 *
 * @param projectSlug - The project slug
 * @param phase - The phase key (e.g., "covering")
 * @returns The configured short phase name (e.g., "Cover" or "Record")
 */
export async function getPhaseShortLabel(
  projectSlug: ProjectSlug,
  phase: PhaseKey
): Promise<string> {
  const terminology = await getProjectTerminology(projectSlug);
  return terminology.phaseShortNames[phase];
}

/**
 * Get user-facing phase description from project configuration
 *
 * @param projectSlug - The project slug
 * @param phase - The phase key (e.g., "covering")
 * @returns The configured phase description
 */
export async function getPhaseDescription(
  projectSlug: ProjectSlug,
  phase: PhaseKey
): Promise<string> {
  const terminology = await getProjectTerminology(projectSlug);
  return terminology.phaseDescriptions[phase];
}

/**
 * Get all phase labels for a project
 * Useful for rendering phase navigation or timelines
 *
 * @param projectSlug - The project slug
 * @returns Object with all phase labels
 */
export async function getAllPhaseLabels(projectSlug: ProjectSlug) {
  const terminology = await getProjectTerminology(projectSlug);
  return {
    phases: terminology.phases,
    shortNames: terminology.phaseShortNames,
    descriptions: terminology.phaseDescriptions,
  };
}

/**
 * Map database field names to phase labels
 * This helps with migrating from hard-coded "covering" terminology
 *
 * Database fields like "coveringBegins" map to the "covering" phase
 */
export const DB_FIELD_TO_PHASE: Record<string, PhaseKey> = {
  signupOpens: "signups",
  votingOpens: "voting",
  coveringBegins: "covering",
  coversDue: "covering",
  listeningParty: "celebration",
};

/**
 * Get phase label from database field name
 *
 * @param projectSlug - The project slug
 * @param fieldName - Database field name (e.g., "coveringBegins")
 * @returns The configured phase name for that field
 *
 * @example
 * ```typescript
 * const label = await getPhaseLabelFromField("cover", "coveringBegins");
 * // Returns: "Covering Phase" or custom value
 * ```
 */
export async function getPhaseLabelFromField(
  projectSlug: ProjectSlug,
  fieldName: string
): Promise<string | null> {
  const phase = DB_FIELD_TO_PHASE[fieldName];
  if (!phase) return null;

  return getPhaseLabel(projectSlug, phase);
}
