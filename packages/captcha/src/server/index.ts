/**
 * @eptss/captcha/server - Server-side bot protection utilities
 *
 * Server-side exports for CAPTCHA verification and logging
 */

export { verifyCaptcha } from './verifyCaptcha';
export { logBotAttempt } from './logBotAttempt';
export { getClientInfo } from './getClientInfo';

export type {
  CaptchaVerificationResult,
  CaptchaConfig,
  ClientInfo,
  BotAttemptData,
} from '../types';
