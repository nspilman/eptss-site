/**
 * @eptss/captcha - Bot protection using Google reCAPTCHA v3
 *
 * Client-side exports for React components and hooks
 */

// Components
export { CaptchaProvider } from './components/CaptchaProvider';

// Hooks
export { useCaptcha } from './hooks/useCaptcha';

// Types
export type {
  CaptchaVerificationResult,
  CaptchaConfig,
  ClientInfo,
  BotAttemptData,
} from './types';
