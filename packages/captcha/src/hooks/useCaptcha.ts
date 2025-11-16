"use client";

/**
 * React hook for executing reCAPTCHA v3
 */

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useCallback } from 'react';

/**
 * Hook to execute reCAPTCHA and get a token
 *
 * @returns Object with executeRecaptcha function and loading state
 *
 * @example
 * ```tsx
 * const { executeRecaptcha, isLoading } = useCaptcha();
 *
 * const handleSubmit = async () => {
 *   const token = await executeRecaptcha('signup');
 *   // Pass token to server
 * };
 * ```
 */
export function useCaptcha() {
  const { executeRecaptcha: googleExecuteRecaptcha } = useGoogleReCaptcha();

  /**
   * Execute reCAPTCHA and get a token
   *
   * @param action - Action name (e.g., 'signup', 'login', 'vote')
   * @returns Promise resolving to the CAPTCHA token, or null if CAPTCHA is not available
   */
  const executeRecaptcha = useCallback(
    async (action: string): Promise<string | null> => {
      if (!googleExecuteRecaptcha) {
        console.warn('[useCaptcha] reCAPTCHA not loaded yet');
        return null;
      }

      try {
        const token = await googleExecuteRecaptcha(action);
        return token;
      } catch (error) {
        console.error('[useCaptcha] Error executing reCAPTCHA:', error);
        return null;
      }
    },
    [googleExecuteRecaptcha]
  );

  return {
    /** Execute reCAPTCHA and get a token */
    executeRecaptcha,
    /** Whether reCAPTCHA is ready to use */
    isReady: !!googleExecuteRecaptcha,
  };
}
