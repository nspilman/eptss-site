/**
 * Email Templates Library
 * 
 * This module exports all email templates and components for easy import
 * throughout the application.
 */

// Templates
export { RoundSignupConfirmation } from './templates/RoundSignupConfirmation';
export { AdminSignupNotification } from './templates/AdminSignupNotification';
export { BaseEmailLayout } from './templates/BaseEmailLayout';

// Components
export { EmailHeader } from './components/EmailHeader';
export { PhaseTimeline, PhaseTimelineItem } from './components/PhaseTimeline';

// Types
export type { default as RoundSignupConfirmationProps } from './templates/RoundSignupConfirmation';
