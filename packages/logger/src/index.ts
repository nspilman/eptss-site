/**
 * @eptss/logger
 *
 * Centralized logging package for EPTSS
 *
 * Usage:
 * - Server-side: import { logger } from '@eptss/logger/server'
 * - Client-side: import { logger } from '@eptss/logger/client'
 */

// Re-export types
export type { LogLevel, LogData, LogEntry, LogContext, Logger } from './types';

// Note: Do not export server or client loggers from index
// They should be imported explicitly from their respective paths
// This prevents accidentally importing server code on client and vice versa
