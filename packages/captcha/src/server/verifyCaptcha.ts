/**
 * Server-side CAPTCHA verification using Google reCAPTCHA v3 API
 */

import type { CaptchaVerificationResult, CaptchaConfig, RecaptchaResponse } from '../types';

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const DEFAULT_SCORE_THRESHOLD = 0.5;

/**
 * Verify a reCAPTCHA v3 token with Google's API
 *
 * @param token - The reCAPTCHA token from the client
 * @param expectedAction - The expected action name (e.g., 'signup')
 * @param config - Optional configuration
 * @returns Verification result with success status and score
 */
export async function verifyCaptcha(
  token: string,
  expectedAction: string,
  config: CaptchaConfig = {}
): Promise<CaptchaVerificationResult> {
  const {
    scoreThreshold = DEFAULT_SCORE_THRESHOLD,
    skipInDevelopment = false,
  } = config;

  // Skip verification in development if configured
  if (skipInDevelopment && process.env.NODE_ENV === 'development') {
    console.log('[CAPTCHA] Skipping verification in development mode');
    return {
      success: true,
      score: 1.0,
      action: expectedAction,
    };
  }

  // Get secret key from environment
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.error('[CAPTCHA] RECAPTCHA_SECRET_KEY not found in environment variables');
    return {
      success: false,
      error: 'CAPTCHA configuration error',
    };
  }

  // Validate token exists
  if (!token) {
    return {
      success: false,
      error: 'No CAPTCHA token provided',
    };
  }

  try {
    // Call Google reCAPTCHA API
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      throw new Error(`reCAPTCHA API returned ${response.status}`);
    }

    const data: RecaptchaResponse = await response.json();

    // Check if verification succeeded
    if (!data.success) {
      console.warn('[CAPTCHA] Verification failed:', data['error-codes']);
      return {
        success: false,
        error: 'CAPTCHA verification failed',
        errorCodes: data['error-codes'],
      };
    }

    // Check if action matches
    if (data.action !== expectedAction) {
      console.warn(`[CAPTCHA] Action mismatch. Expected: ${expectedAction}, Got: ${data.action}`);
      return {
        success: false,
        error: 'CAPTCHA action mismatch',
        score: data.score,
        action: data.action,
      };
    }

    // Check if score meets threshold
    const score = data.score ?? 0;
    if (score < scoreThreshold) {
      console.warn(`[CAPTCHA] Score below threshold. Score: ${score}, Threshold: ${scoreThreshold}`);
      return {
        success: false,
        error: 'CAPTCHA score too low',
        score,
        action: data.action,
      };
    }

    // Success!
    console.log(`[CAPTCHA] Verification successful. Score: ${score}, Action: ${data.action}`);
    return {
      success: true,
      score,
      action: data.action,
    };
  } catch (error) {
    console.error('[CAPTCHA] Verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown verification error',
    };
  }
}
