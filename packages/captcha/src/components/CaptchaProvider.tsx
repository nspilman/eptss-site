"use client";

/**
 * CAPTCHA Provider Component
 * Wraps the Google reCAPTCHA v3 provider with configuration
 */

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

interface CaptchaProviderProps {
  children: React.ReactNode;
  /** Optional language code (default: auto-detect) */
  language?: string;
  /** Whether to use reCAPTCHA enterprise (default: false) */
  useEnterprise?: boolean;
}

/**
 * Wrapper component for Google reCAPTCHA v3
 * Provides the reCAPTCHA context to child components
 *
 * @example
 * ```tsx
 * <CaptchaProvider>
 *   <YourFormComponent />
 * </CaptchaProvider>
 * ```
 */
export function CaptchaProvider({
  children,
  language,
  useEnterprise = false,
}: CaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Don't render if site key is not configured
  if (!siteKey) {
    console.error('[CaptchaProvider] NEXT_PUBLIC_RECAPTCHA_SITE_KEY not found in environment');
    // Return children without CAPTCHA protection in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[CaptchaProvider] Running without CAPTCHA protection in development');
      return <>{children}</>;
    }
    // In production, this is a critical error
    throw new Error('CAPTCHA not configured. Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY');
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      language={language}
      useEnterprise={useEnterprise}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
