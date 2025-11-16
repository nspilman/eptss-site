/**
 * Type definitions for the CAPTCHA package
 */

/**
 * Result of CAPTCHA verification
 */
export interface CaptchaVerificationResult {
  /** Whether the CAPTCHA verification was successful */
  success: boolean;
  /** The score from reCAPTCHA v3 (0.0 to 1.0, higher is more likely human) */
  score?: number;
  /** The action name that was verified */
  action?: string;
  /** Error message if verification failed */
  error?: string;
  /** Error codes from reCAPTCHA API */
  errorCodes?: string[];
}

/**
 * Configuration for CAPTCHA verification
 */
export interface CaptchaConfig {
  /** Minimum score threshold (default: 0.5) */
  scoreThreshold?: number;
  /** Whether to skip CAPTCHA in development mode */
  skipInDevelopment?: boolean;
}

/**
 * Client information for logging bot attempts
 */
export interface ClientInfo {
  /** Client IP address */
  ipAddress?: string;
  /** Client user agent string */
  userAgent?: string;
}

/**
 * Data for logging a bot attempt
 */
export interface BotAttemptData {
  /** Client IP address */
  ipAddress?: string;
  /** Client user agent */
  userAgent?: string;
  /** CAPTCHA score (if available) */
  captchaScore?: number;
  /** Type of attempt (signup, login, vote, etc.) */
  attemptType: string;
  /** Additional metadata as JSON */
  metadata?: Record<string, any>;
}

/**
 * Response from the Google reCAPTCHA API
 */
export interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}
