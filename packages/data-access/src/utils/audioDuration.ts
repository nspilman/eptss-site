/**
 * Audio Duration Utilities
 *
 * The database stores audio duration in milliseconds for precision.
 * These utilities help convert between different formats.
 */

/**
 * Convert seconds to milliseconds
 * @param seconds - Duration in seconds (can be decimal)
 * @returns Duration in milliseconds (rounded to nearest integer)
 */
export function secondsToMilliseconds(seconds: number): number {
  return Math.round(seconds * 1000);
}

/**
 * Convert milliseconds to seconds
 * @param milliseconds - Duration in milliseconds
 * @returns Duration in seconds (decimal)
 */
export function millisecondsToSeconds(milliseconds: number): number {
  return milliseconds / 1000;
}

/**
 * Format milliseconds as human-readable time string
 * @param milliseconds - Duration in milliseconds
 * @param options - Formatting options
 * @returns Formatted duration string (e.g., "3:45", "1:23:45", "0:12.5")
 */
export function formatDuration(
  milliseconds: number | null | undefined,
  options: {
    includeHours?: boolean;
    includeMilliseconds?: boolean;
    alwaysShowHours?: boolean;
  } = {}
): string {
  if (milliseconds === null || milliseconds === undefined) {
    return "0:00";
  }

  const totalSeconds = milliseconds / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const ms = milliseconds % 1000;

  // Build the time string
  const parts: string[] = [];

  // Hours (only if > 0 or alwaysShowHours is true)
  if (hours > 0 || options.alwaysShowHours) {
    parts.push(String(hours));
  }

  // Minutes (pad if hours are shown)
  if (parts.length > 0) {
    parts.push(String(minutes).padStart(2, "0"));
  } else {
    parts.push(String(minutes));
  }

  // Seconds (always pad)
  parts.push(String(seconds).padStart(2, "0"));

  let result = parts.join(":");

  // Milliseconds (optional)
  if (options.includeMilliseconds) {
    result += `.${String(ms).padStart(3, "0")}`;
  }

  return result;
}

/**
 * Format milliseconds as short duration (e.g., "3m 45s", "1h 23m")
 * @param milliseconds - Duration in milliseconds
 * @param options - Formatting options
 * @returns Short formatted duration string
 */
export function formatDurationShort(
  milliseconds: number | null | undefined,
  options: {
    includeSeconds?: boolean;
  } = { includeSeconds: true }
): string {
  if (milliseconds === null || milliseconds === undefined) {
    return "0s";
  }

  const totalSeconds = milliseconds / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (options.includeSeconds && (seconds > 0 || parts.length === 0)) {
    parts.push(`${seconds}s`);
  }

  return parts.join(" ");
}

/**
 * Parse time string to milliseconds
 * Supports formats: "3:45", "1:23:45", "3m 45s", "1h 23m 45s"
 * @param timeString - Time string to parse
 * @returns Duration in milliseconds, or null if invalid
 */
export function parseDuration(timeString: string): number | null {
  if (!timeString || timeString.trim() === "") {
    return null;
  }

  const str = timeString.trim();

  // Try colon format first (3:45 or 1:23:45)
  if (str.includes(":")) {
    const parts = str.split(":").map(Number);

    if (parts.some(isNaN)) {
      return null;
    }

    if (parts.length === 2) {
      // M:SS
      const [minutes, seconds] = parts;
      return (minutes * 60 + seconds) * 1000;
    } else if (parts.length === 3) {
      // H:MM:SS
      const [hours, minutes, seconds] = parts;
      return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }
  }

  // Try text format (3m 45s, 1h 23m 45s)
  const hoursMatch = str.match(/(\d+)h/);
  const minutesMatch = str.match(/(\d+)m/);
  const secondsMatch = str.match(/(\d+)s/);

  const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
  const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;

  if (hours === 0 && minutes === 0 && seconds === 0) {
    return null;
  }

  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

/**
 * Check if a duration is valid (not null and within reasonable bounds)
 * @param milliseconds - Duration in milliseconds
 * @param options - Validation options
 * @returns True if valid, false otherwise
 */
export function isValidDuration(
  milliseconds: number | null | undefined,
  options: {
    minMs?: number; // Minimum duration in milliseconds (default: 0)
    maxMs?: number; // Maximum duration in milliseconds (default: 24 hours)
  } = {}
): boolean {
  if (milliseconds === null || milliseconds === undefined) {
    return false;
  }

  if (isNaN(milliseconds) || !isFinite(milliseconds)) {
    return false;
  }

  const minMs = options.minMs ?? 0;
  const maxMs = options.maxMs ?? 24 * 60 * 60 * 1000; // 24 hours default

  return milliseconds >= minMs && milliseconds <= maxMs;
}
