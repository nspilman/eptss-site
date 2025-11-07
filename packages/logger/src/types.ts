export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogData {
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  environment: string;
  requestId?: string;
  userId?: string;
  [key: string]: any;
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  email?: string;
  metadata?: Record<string, any>;
}

export interface Logger {
  debug(message: string, data?: LogData): void;
  info(message: string, data?: LogData): void;
  warn(message: string, data?: LogData): void;
  error(message: string, data?: LogData): void;
  setContext(context: LogContext): void;
  clearContext(): void;
}
