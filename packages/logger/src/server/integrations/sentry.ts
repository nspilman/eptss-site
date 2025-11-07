import * as Sentry from '@sentry/nextjs';
import { LogLevel, LogData } from '../../types';

export function sendToSentry(level: LogLevel, message: string, data?: LogData): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const sentryLevel = mapToSentryLevel(level);

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
    // For debug/info/warn, capture as message
    Sentry.captureMessage(message, {
      level: sentryLevel,
      extra: data,
    });
  }
}

function mapToSentryLevel(level: LogLevel): Sentry.SeverityLevel {
  const mapping: Record<LogLevel, Sentry.SeverityLevel> = {
    debug: 'debug',
    info: 'info',
    warn: 'warning',
    error: 'error',
  };
  return mapping[level];
}
