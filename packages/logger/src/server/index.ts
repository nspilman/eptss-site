/**
 * Server-side structured logging utility
 *
 * Features:
 * - Structured logging with 4 levels (debug, info, warn, error)
 * - Environment-aware (production vs development)
 * - Integrates with Sentry for error tracking
 * - Integrates with PostHog for server-side analytics
 * - Request context tracking (requestId, userId)
 * - Fire-and-forget pattern to avoid blocking
 * - CloudWatch-ready JSON output in production
 */

import { sendToSentry } from './integrations/sentry';
import { sendToPostHog } from './integrations/posthog';
import { getContext } from './middleware/context';
import type { LogLevel, LogData, LogEntry, LogContext, Logger } from '../types';

class ServerLogger implements Logger {
  private async log(level: LogLevel, message: string, data?: LogData) {
    const timestamp = new Date().toISOString();
    const environment = process.env.NODE_ENV || 'development';
    const context = getContext();

    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      environment,
      requestId: context?.requestId,
      userId: context?.userId,
      ...context?.metadata,
      ...data,
    };

    // Send to monitoring services in production
    if (process.env.NODE_ENV === 'production') {
      // 1. Send to Sentry for error tracking
      sendToSentry(level, message, data);

      // 2. Send to PostHog for analytics (server-side)
      void sendToPostHog(level, message, data, context?.userId || 'server');

      // 3. Log to console for CloudWatch/server logs
      console[level === 'debug' ? 'log' : level](JSON.stringify(logEntry));
    } else {
      // Development: Pretty print with emojis
      const emoji = getEmojiForLevel(level);
      const contextStr = context?.requestId ? ` [${context.requestId}]` : '';
      console[level === 'debug' ? 'log' : level](
        `${emoji} [${level.toUpperCase()}]${contextStr} ${message}`,
        data || ''
      );
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, data?: LogData) {
    if (process.env.NODE_ENV === 'development') {
      void this.log('debug', message, data);
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, data?: LogData) {
    void this.log('info', message, data);
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: LogData) {
    void this.log('warn', message, data);
  }

  /**
   * Log error messages
   */
  error(message: string, data?: LogData) {
    void this.log('error', message, data);
  }

  /**
   * Log server action execution
   */
  action(actionName: string, status: 'started' | 'completed' | 'failed', data?: LogData) {
    const message = `Action ${actionName} ${status}`;
    const level = status === 'failed' ? 'error' : 'info';
    void this.log(level, message, { actionName, status, ...data });
  }

  /**
   * Set context for current async execution
   */
  setContext(context: LogContext) {
    // Context is managed by middleware/context.ts
    // This is a no-op for the logger itself
  }

  /**
   * Clear context
   */
  clearContext() {
    // Context is managed by middleware/context.ts
    // This is a no-op for the logger itself
  }
}

function getEmojiForLevel(level: LogLevel): string {
  const emojiMap: Record<LogLevel, string> = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
  };
  return emojiMap[level];
}

export const logger = new ServerLogger();

// Re-export context helpers
export { setContext, getContext, clearContext, runWithContext, generateRequestId } from './middleware/context';
export type { LogContext } from '../types';
