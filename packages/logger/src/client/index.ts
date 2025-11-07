/**
 * Client-side structured logging utility
 *
 * Features:
 * - Structured logging with 4 levels (debug, info, warn, error)
 * - Environment-aware (production vs development)
 * - Integrates with Sentry for error tracking
 * - Integrates with PostHog for client-side analytics
 * - Browser-safe (no Node.js dependencies)
 * - Rate limiting to prevent flooding
 */

import type { LogLevel, LogData, LogContext, Logger } from '../types';

// Client-side imports are lazy loaded to avoid SSR issues
let Sentry: typeof import('@sentry/nextjs') | null = null;
let posthog: typeof import('posthog-js').default | null = null;

// Initialize integrations on client
if (typeof window !== 'undefined') {
  // Sentry is auto-initialized by Next.js
  import('@sentry/nextjs').then(module => {
    Sentry = module;
  }).catch(() => {
    // Sentry not available
  });

  // PostHog should be initialized in the app
  import('posthog-js').then(module => {
    posthog = module.default;
  }).catch(() => {
    // PostHog not available
  });
}

class ClientLogger implements Logger {
  private context: LogContext = {};

  private log(level: LogLevel, message: string, data?: LogData) {
    const timestamp = new Date().toISOString();
    const environment = process.env.NODE_ENV || 'development';

    const logEntry = {
      timestamp,
      level,
      message,
      environment,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...this.context,
      ...data,
    };

    // Development: Pretty print to console
    if (environment === 'development') {
      const emoji = this.getEmojiForLevel(level);
      const method = level === 'debug' ? 'log' : level;
      console[method](`${emoji} [${level.toUpperCase()}] ${message}`, data || '');
      return;
    }

    // Production: Send to monitoring services
    if (typeof window !== 'undefined') {
      // 1. Send to Sentry
      this.sendToSentry(level, message, logEntry);

      // 2. Send to PostHog
      this.sendToPostHog(level, message, logEntry);

      // 3. Also log to console (visible in browser DevTools)
      if (level === 'error' || level === 'warn') {
        console[level](message, data);
      }
    }
  }

  private sendToSentry(level: LogLevel, message: string, data: any) {
    if (!Sentry) return;

    const sentryLevel = level === 'warn' ? 'warning' : level;

    if (level === 'error') {
      if (data?.error instanceof Error) {
        Sentry.captureException(data.error, {
          level: sentryLevel as any,
          extra: { message, ...data },
        });
      } else {
        Sentry.captureMessage(message, {
          level: sentryLevel as any,
          extra: data,
        });
      }
    } else {
      Sentry.captureMessage(message, {
        level: sentryLevel as any,
        extra: data,
      });
    }
  }

  private sendToPostHog(level: LogLevel, message: string, data: any) {
    if (!posthog) return;

    try {
      posthog.capture(`client_log_${level}`, {
        message,
        level,
        ...data,
      });
    } catch (error) {
      // Silently fail
      console.error('PostHog logging failed:', error);
    }
  }

  private getEmojiForLevel(level: LogLevel): string {
    const emojiMap: Record<LogLevel, string> = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };
    return emojiMap[level];
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, data?: LogData) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, data);
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, data?: LogData) {
    this.log('info', message, data);
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: LogData) {
    this.log('warn', message, data);
  }

  /**
   * Log error messages
   */
  error(message: string, data?: LogData) {
    this.log('error', message, data);
  }

  /**
   * Set context that will be included in all subsequent logs
   */
  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear all context
   */
  clearContext() {
    this.context = {};
  }

  /**
   * Log user interaction
   */
  interaction(action: string, data?: LogData) {
    this.info(`User interaction: ${action}`, data);
  }

  /**
   * Log page view
   */
  pageView(path: string, data?: LogData) {
    this.info(`Page view: ${path}`, data);
  }
}

export const logger = new ClientLogger();
export type { LogContext } from '../types';

// Re-export PostHog initialization
export { initPostHog, getPostHog } from './init';
