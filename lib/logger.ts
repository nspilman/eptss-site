/**
 * Structured logging utility for Server Actions
 * 
 * Integrates with Sentry for error tracking and monitoring
 */

import * as Sentry from '@sentry/nextjs';

type LogLevel = 'info' | 'warn' | 'error';

interface LogData {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  environment: string;
  [key: string]: any;
}

class Logger {
  private log(level: LogLevel, message: string, data?: LogData) {
    const timestamp = new Date().toISOString();
    const environment = process.env.NODE_ENV || 'development';
    
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      environment,
      ...data,
    };

    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      // Map log levels to Sentry severity
      const sentryLevel = level === 'error' ? 'error' : level === 'warn' ? 'warning' : 'info';
      
      if (level === 'error') {
        // For errors, capture as exception if there's an error object
        if (data?.error instanceof Error) {
          Sentry.captureException(data.error, {
            level: sentryLevel,
            extra: { message, ...data },
          });
        } else {
          Sentry.captureMessage(message, {
            level: sentryLevel,
            extra: data,
          });
        }
      } else {
        // For info/warn, capture as message
        Sentry.captureMessage(message, {
          level: sentryLevel,
          extra: data,
        });
      }
      
      // Also log to console for CloudWatch/server logs
      console[level](JSON.stringify(logEntry));
    } else {
      // Development: Pretty print
      const emoji = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
      console[level](`${emoji} [${level.toUpperCase()}] ${message}`, data || '');
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
   * Log action execution
   */
  action(actionName: string, status: 'started' | 'completed' | 'failed', data?: LogData) {
    const message = `Action ${actionName} ${status}`;
    const level = status === 'failed' ? 'error' : 'info';
    this.log(level, message, { actionName, status, ...data });
  }
}

export const logger = new Logger();
